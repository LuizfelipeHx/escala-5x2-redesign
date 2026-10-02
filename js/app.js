/* Ponto de entrada: guarda o estado da tela, decide o que desenhar
   e trata os cliques. Não contém regra de negócio nem HTML de tela. */
(function (E) {
  "use strict";

  const D = E.datas;
  const R = E.escala;
  const $ = (s) => document.querySelector(s);

  E.repositorio.carregar();

  const ABAS_UNIDADE = [
    { id: "hoje", rotulo: "Hoje", tela: "hoje", filtros: true },
    { id: "semana", rotulo: "Semana", tela: "semana", filtros: true },
    { id: "cobertura", rotulo: "Cobertura", tela: "cobertura" },
    { id: "historico", rotulo: "Absenteísmo", tela: "historico" },
    { id: "risco", rotulo: "Calendário de risco", tela: "risco" },
    { id: "individual", rotulo: "Escala individual", tela: "individual" },
    { id: "cadastro", rotulo: "Cadastro", tela: "cadastro" },
  ];
  const ABA_GERAL = { id: "geral", rotulo: "Visão geral", tela: "geral", semFaixa: true };
  const ABAS_COLABORADOR = [{ id: "minha", rotulo: "Minha escala", tela: "colaborador" }];

  const estado = {
    usuario: null,
    aba: null,
    unidadeId: null,
    pessoaMatricula: null,
    data: D.hoje(),
    mes: D.inicioDoMes(D.hoje()),
    inicioCobertura: D.hoje(),
    busca: "",
    funcao: "",
    mesHistorico: "2026-09",
    mesRisco: "2026-11",
    diaRisco: null,
  };

  // Liderança com mais de um CDD ganha a "Visão geral" consolidada.
  function abas() {
    if (!E.sessao.ehLideranca(estado.usuario)) return ABAS_COLABORADOR;
    return estado.usuario.unidadeIds.length > 1 ? [ABA_GERAL, ...ABAS_UNIDADE] : ABAS_UNIDADE;
  }
  const abaAtual = () => abas().find((a) => a.id === estado.aba) || abas()[0];
  const unidadeAtual = () => R.unidade(estado.unidadeId);

  function selecionarUnidade(id) {
    const u = R.unidade(id);
    Object.assign(estado, { unidadeId: id, pessoaMatricula: u.equipe[0]?.matricula || null, busca: "", funcao: "" });
    const busca = $("#f-busca"), funcao = $("#f-funcao");
    if (busca) busca.value = "";
    if (funcao) funcao.value = "";
  }

  /* ---------- Desenho ---------- */
  function montar() {
    fecharDialogo();
    estado.usuario = E.sessao.atual();
    if (!estado.usuario) {
      $("#app").innerHTML = E.telas.login.render();
      return;
    }
    Object.assign(estado, { aba: abas()[0].id, data: D.hoje(), mes: D.inicioDoMes(D.hoje()), inicioCobertura: D.hoje() });
    $("#app").innerHTML = E.ui.layout(estado.usuario, abas(), R.validarDados());
    selecionarUnidade(estado.usuario.unidadeIds[0]);
    atualizar();
  }

  function atualizar() {
    const aba = abaAtual();
    document.querySelectorAll(".aba").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === aba.id));
    $("#filtros").classList.toggle("oculto", !aba.filtros);
    $("#faixa-unidade").innerHTML = aba.semFaixa ? "" : E.ui.faixaUnidade(unidadeAtual(), estado.usuario.unidadeIds);
    $("#conteudo").innerHTML = E.telas[aba.tela].render(estado);
  }

  function entrar(matricula, senha) {
    const r = E.sessao.entrar(matricula, senha);
    if (r.erro) {
      const campo = $("#login-erro");
      if (campo) campo.textContent = r.erro;
      return;
    }
    montar();
  }

  /* ---------- Janela de formulário (<dialog>) ---------- */
  function abrirDialogo(html) {
    const d = $("#dialogo");
    d.innerHTML = html;
    d.showModal();
    d.querySelector("input, select")?.focus();
  }
  function fecharDialogo() {
    const d = $("#dialogo");
    if (d?.open) d.close();
  }

  function mostrarErros(alvo, erros) {
    if (alvo) alvo.innerHTML = erros.map((e) => `<span>${E.ui.esc(e)}</span>`).join("");
    else window.alert(erros.join("\n"));
  }

  // Depois de gravar: se deu certo, fecha o formulário e redesenha.
  // Se a alteração afetou o próprio usuário logado, remonta tudo.
  function concluir(resultado, alvoErros = null) {
    if (resultado.erros) return mostrarErros(alvoErros, resultado.erros);
    fecharDialogo();
    const antes = estado.usuario;
    if (!E.sessao.atual() || !R.unidade(estado.unidadeId)) return montar();
    estado.usuario = E.sessao.atual();
    if (antes.perfil !== estado.usuario.perfil || antes.unidadeIds.join() !== estado.usuario.unidadeIds.join()) return montar();
    if (!R.unidade(estado.unidadeId).equipe.some((p) => p.matricula === estado.pessoaMatricula)) {
      estado.pessoaMatricula = R.unidade(estado.unidadeId).equipe[0]?.matricula || null;
    }
    atualizar();
  }

  function baixar(nome, texto) {
    const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: nome });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------- Ações dos botões (data-acao) ---------- */
  const PASSO_COBERTURA = E.telas.cobertura.DIAS_ANALISADOS;
  const C = E.telas.cadastro;
  const Repo = E.repositorio;
  const nomeDe = (m) => R.porMatricula(m)?.nome || m;

  const ACOES = {
    "risco-ant": () => { moverMesRisco(-1); },
    "risco-prox": () => { moverMesRisco(1); },
    "risco-dia": (el) => { estado.diaRisco = el.dataset.dia; },
    "dia-ant":  () => { estado.data = D.addDias(estado.data, -1); },
    "dia-prox": () => { estado.data = D.addDias(estado.data, 1); },
    "sem-ant":  () => { estado.data = D.addDias(estado.data, -7); },
    "sem-prox": () => { estado.data = D.addDias(estado.data, 7); },
    "cob-ant":  () => { estado.inicioCobertura = D.addDias(estado.inicioCobertura, -PASSO_COBERTURA); },
    "cob-prox": () => { estado.inicioCobertura = D.addDias(estado.inicioCobertura, PASSO_COBERTURA); },
    "ir-hoje":  () => { estado.data = D.hoje(); estado.inicioCobertura = D.hoje(); },
    "mes-ant":  () => { estado.mes = D.addMeses(estado.mes, -1); },
    "mes-prox": () => { estado.mes = D.addMeses(estado.mes, 1); },
    "mes-hoje": () => { estado.mes = D.inicioDoMes(D.hoje()); },
    "abrir-unidade": (el) => { selecionarUnidade(el.dataset.unidade); estado.aba = "hoje"; window.scrollTo({ top: 0, behavior: "smooth" }); },

    // Cadastro: estas ações cuidam do próprio redesenho.
    "nova-pessoa":     () => { abrirDialogo(C.formPessoa(unidadeAtual(), null)); return false; },
    "editar-pessoa":   (el) => { abrirDialogo(C.formPessoa(unidadeAtual(), R.porMatricula(el.dataset.alvo))); return false; },
    "nova-ocorrencia": () => { abrirDialogo(C.formOcorrencia(unidadeAtual())); return false; },
    "fechar-dialogo":  () => { fecharDialogo(); return false; },
    "desligar-pessoa": (el) => {
      if (window.confirm(`Registrar o desligamento de ${nomeDe(el.dataset.alvo)} com data de hoje?\nO histórico de faltas continua guardado.`)) {
        concluir(Repo.desligarPessoa(el.dataset.alvo, D.iso(D.hoje())));
      }
      return false;
    },
    "excluir-pessoa": (el) => {
      if (window.confirm(`Excluir o cadastro de ${nomeDe(el.dataset.alvo)}?\nIsso apaga também o histórico. Use só para cadastro feito por engano.`)) {
        concluir(Repo.excluirPessoa(el.dataset.alvo), $("#dialogo .form-erros"));
      }
      return false;
    },
    "excluir-ocorrencia": (el) => {
      if (window.confirm("Excluir esta ocorrência?")) concluir(Repo.excluirOcorrencia(estado.unidadeId, Number(el.dataset.indice)));
      return false;
    },
    "exportar": () => { baixar(`escala5x2-dados-${D.iso(D.hoje())}.json`, Repo.exportar()); return false; },
    "restaurar": () => {
      if (window.confirm("Apagar as alterações deste navegador e voltar aos dados de exemplo?")) concluir(Repo.restaurarExemplo());
      return false;
    },
  };

  const podeVerEquipe = () => E.sessao.ehLideranca(estado.usuario);

  function moverMesRisco(passo) {
    const mes = D.chaveMes(D.addMeses(D.deIso(`${estado.mesRisco}-01`), passo));
    if (mes >= "2025-01" && mes <= "2027-12") { estado.mesRisco = mes; estado.diaRisco = null; }
  }

  function abrirPessoa(matricula) {
    Object.assign(estado, { pessoaMatricula: matricula, mes: D.inicioDoMes(estado.data), aba: "individual" });
    atualizar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const alvo = e.target;
    const acao = alvo.closest("[data-acao]");

    if (acao?.dataset.acao === "sair") { E.sessao.sair(); return montar(); }
    if (acao?.dataset.acao === "ver-senha") return E.telas.login.alternarSenha(acao);

    const aba = alvo.closest(".aba");
    if (aba) { estado.aba = aba.dataset.aba; return atualizar(); }

    const pessoa = alvo.closest("[data-id]");
    if (pessoa && podeVerEquipe()) return abrirPessoa(pessoa.dataset.id);

    const fn = acao && ACOES[acao.dataset.acao];
    if (fn && fn(acao) !== false) atualizar();
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    const erros = form.querySelector(".form-erros");
    const u = form.dataset.unidade && R.unidade(form.dataset.unidade);
    e.preventDefault();

    if (form.id === "form-login") return entrar(form.elements.matricula.value, form.elements.senha.value);
    if (form.id === "form-pessoa") return concluir(Repo.salvarPessoa(u.id, C.lerPessoa(form, u), form.dataset.original), erros);
    if (form.id === "form-ocorrencia") return concluir(Repo.salvarOcorrencia(u.id, C.lerOcorrencia(form)), erros);
    if (form.id === "form-unidade") return concluir(Repo.salvarUnidade(u.id, C.lerUnidade(form, u)), erros);
  });

  document.addEventListener("change", (e) => {
    const el = e.target;

    // Seletor de dias: no máximo 2 marcados.
    const grupo = el.closest(".dias[data-max]");
    if (grupo && el.checked && grupo.querySelectorAll("input:checked").length > Number(grupo.dataset.max)) {
      el.checked = false;
      return;
    }

    if (el.id === "arquivo-importar" && el.files[0]) {
      el.files[0].text().then((texto) => concluir(Repo.importar(texto)));
      return;
    }

    const { id, value } = el;
    if (id === "risco-mes" && /^\d{4}-\d{2}$/.test(value) && value >= "2025-01" && value <= "2027-12") { estado.mesRisco = value; estado.diaRisco = null; }
    else if (id === "historico-mes" && /^\d{4}-\d{2}$/.test(value)) estado.mesHistorico = value;
    else if (id === "data-sel" && value) estado.data = D.deIso(value);
    else if (id === "pessoa-sel") estado.pessoaMatricula = value;
    else if (id === "unidade-sel") selecionarUnidade(value);
    else if (id === "f-funcao") estado.funcao = value;
    else return;
    atualizar();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id !== "f-busca") return;
    estado.busca = e.target.value;
    atualizar();
  });

  montar();
})(window.Escala);
