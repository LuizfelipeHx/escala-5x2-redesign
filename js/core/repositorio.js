/* Repositório: única porta de entrada para LER e ALTERAR os dados.

   Nesta versão os dados alterados ficam no localStorage do navegador
   (cada pessoa vê só o que ela cadastrou). Para usar um banco de dados de
   verdade no futuro, só este arquivo muda: as telas continuam chamando
   salvarPessoa, salvarUnidade etc.

   Toda alteração roda dentro de uma "transação": se os dados ficarem
   inválidos, a alteração é desfeita e os erros voltam para a tela. */
(function (E) {
  "use strict";

  const VERSAO = 1;
  let chave = "escala5x2-redesign.dados";
  let exemplo = null;        // cópia intocada dos arquivos da pasta dados/
  let personalizado = false; // true quando há alterações salvas no navegador
  let avisoCarga = "";

  const clonar = (x) => JSON.parse(JSON.stringify(x));
  const ler = () => { try { return localStorage.getItem(chave); } catch (_) { return null; } };
  const gravar = (texto) => { try { localStorage.setItem(chave, texto); return true; } catch (_) { return false; } };
  const apagar = () => { try { localStorage.removeItem(chave); } catch (_) { /* nada a fazer */ } };

  function usar(dados) {
    E.dados = dados;
    E.escala.reindexar();
  }

  function carregar(opcoes = {}) {
    if (opcoes.chave) chave = opcoes.chave;
    if (!exemplo) exemplo = clonar(E.dados);
    if (opcoes.limpar) apagar();
    personalizado = false;
    avisoCarga = "";

    const salvo = ler();
    if (!salvo) { usar(clonar(exemplo)); return; }
    try {
      const pacote = JSON.parse(salvo);
      if (pacote.versao !== VERSAO) throw new Error("formato de outra versão");
      usar(pacote.dados);
      const erros = E.escala.validarDados();
      if (erros.length) throw new Error(erros[0]);
      personalizado = true;
    } catch (e) {
      usar(clonar(exemplo));
      avisoCarga = `As alterações salvas neste navegador não puderam ser lidas e foram ignoradas (${e.message}).`;
    }
  }

  function persistir() {
    personalizado = gravar(JSON.stringify({ versao: VERSAO, salvoEm: new Date().toISOString(), dados: E.dados }));
  }

  function transacao(alterar) {
    const antes = clonar(E.dados);
    try {
      alterar(E.dados);
    } catch (e) {
      usar(antes);
      return { erros: [e.message] };
    }
    E.escala.reindexar();
    const erros = E.escala.validarDados();
    if (erros.length) { usar(antes); return { erros }; }
    persistir();
    return { ok: true };
  }

  /* ---------- Apoio ---------- */
  function acharUnidade(dados, id) {
    const u = dados.unidades.find((x) => x.id === id);
    if (!u) throw new Error("Unidade não encontrada.");
    return u;
  }
  function acharPessoa(dados, matricula) {
    for (const u of dados.unidades) {
      const p = u.equipe.find((x) => x.matricula === matricula);
      if (p) return { u, p };
    }
    throw new Error("Colaborador não encontrado.");
  }
  function renomearMatricula(u, antiga, nova) {
    u.ausencias.forEach((a) => { if (a.matricula === antiga) a.matricula = nova; });
    Object.values(u.meses || {}).forEach((m) => {
      if (m.folgas[antiga]) { m.folgas[nova] = m.folgas[antiga]; delete m.folgas[antiga]; }
    });
  }
  const exigir = (condicao, mensagem) => { if (!condicao) throw new Error(mensagem); };
  const segundaDestaSemana = () => E.datas.iso(E.datas.segundaDaSemana(E.datas.hoje()));

  /* ---------- Unidade (tipo de jornada e cobertura) ---------- */
  // Ao trocar o tipo de jornada, preenche um padrão para quem ainda não tem os
  // campos do novo tipo. Os campos do tipo antigo são mantidos, para que
  // voltar ao tipo anterior recupere a escala de antes.
  function salvarUnidade(id, campos) {
    return transacao((dados) => {
      const u = acharUnidade(dados, id);
      exigir(E.regras[campos.tipoEscala], "Tipo de jornada inválido.");
      u.tipoEscala = campos.tipoEscala;
      u.coberturaMinima = { ...u.coberturaMinima, ...campos.coberturaMinima };
      if (u.tipoEscala === "rotativa") {
        u.inicioCiclo = campos.inicioCiclo || u.inicioCiclo || segundaDestaSemana();
        u.equipe.forEach((p, i) => { if (p.posicaoInicial === undefined) p.posicaoInicial = i % 7; });
      }
      if (u.tipoEscala === "fixa") u.equipe.forEach((p) => { if (!p.folgas) p.folgas = [6, 0]; });
      if (u.tipoEscala === "mensal" && !u.meses) u.meses = {};
    });
  }
  /* ---------- Equipe ---------- */
  // "original" é a matrícula antes da edição (vazia para um cadastro novo).
  function salvarPessoa(unidadeId, dadosPessoa, original) {
    return transacao((dados) => {
      const u = acharUnidade(dados, unidadeId);
      const { folgasMensais, ...pessoa } = dadosPessoa;
      exigir(pessoa.nome && pessoa.nome.trim(), "Informe o nome.");
      exigir(/^\d+$/.test(pessoa.matricula || ""), "A matrícula deve ter só números.");
      exigir(pessoa.rota && pessoa.rota.trim(), "Informe a rota.");
      exigir(E.documentos.pisOuCpfValido(pessoa.pis), "PIS/CPF inválido (11 dígitos com dígito verificador).");
      pessoa.nome = pessoa.nome.trim();
      pessoa.rota = pessoa.rota.trim();
      pessoa.pis = E.documentos.soDigitos(pessoa.pis);
      ["admissao", "desligamento"].forEach((k) => { if (!pessoa[k]) delete pessoa[k]; });

      const i = original ? u.equipe.findIndex((x) => x.matricula === original) : -1;
      exigir(!original || i >= 0, "Colaborador não encontrado.");
      if (i >= 0) u.equipe[i] = { ...u.equipe[i], ...pessoa };
      else u.equipe.push(pessoa);
      if (original && original !== pessoa.matricula) renomearMatricula(u, original, pessoa.matricula);

      Object.entries(folgasMensais || {}).forEach(([mes, dias]) => {
        const m = u.meses && u.meses[mes];
        if (!m) return;
        if (dias.length) m.folgas[pessoa.matricula] = dias;
        else delete m.folgas[pessoa.matricula];
      });
    });
  }

  function desligarPessoa(matricula, dataIso) {
    return transacao((dados) => {
      const { p } = acharPessoa(dados, matricula);
      p.desligamento = dataIso;
    });
  }

  // Exclusão total, para cadastro feito por engano (apaga o histórico também).
  function excluirPessoa(matricula) {
    return transacao((dados) => {
      const { u } = acharPessoa(dados, matricula);
      u.equipe = u.equipe.filter((x) => x.matricula !== matricula);
      u.ausencias = u.ausencias.filter((a) => a.matricula !== matricula);
      Object.values(u.meses || {}).forEach((m) => { delete m.folgas[matricula]; });
    });
  }

  /* ---------- Ocorrências (férias, atestado, afastamento, falta) ---------- */
  function salvarOcorrencia(unidadeId, oc) {
    return transacao((dados) => {
      const u = acharUnidade(dados, unidadeId);
      exigir(oc.inicio && oc.fim, "Informe o início e o fim.");
      u.ausencias.push({ matricula: oc.matricula, tipo: oc.tipo, inicio: oc.inicio, fim: oc.fim });
    });
  }

  function excluirOcorrencia(unidadeId, indice) {
    return transacao((dados) => {
      const u = acharUnidade(dados, unidadeId);
      exigir(u.ausencias[indice], "Ocorrência não encontrada.");
      u.ausencias.splice(indice, 1);
    });
  }

  /* ---------- Exportar, importar e restaurar ---------- */
  const exportar = () => JSON.stringify({ versao: VERSAO, exportadoEm: new Date().toISOString(), dados: E.dados }, null, 2);

  function importar(texto) {
    let pacote;
    try { pacote = JSON.parse(texto); } catch (_) { return { erros: ["O arquivo não é um JSON válido."] }; }
    if (!pacote || pacote.versao !== VERSAO || !pacote.dados?.unidades) return { erros: ["Arquivo de outra versão ou formato."] };
    const antes = clonar(E.dados);
    usar(pacote.dados);
    const erros = E.escala.validarDados();
    if (erros.length) { usar(antes); return { erros }; }
    persistir();
    return { ok: true };
  }

  function restaurarExemplo() {
    apagar();
    usar(clonar(exemplo));
    personalizado = false;
    return { ok: true };
  }

  E.repositorio = Object.freeze({
    carregar, salvarUnidade, salvarPessoa, desligarPessoa, excluirPessoa,
    salvarOcorrencia, excluirOcorrencia, exportar, importar, restaurarExemplo,
    personalizado: () => personalizado,
    avisoCarga: () => avisoCarga,
  });
})(window.Escala);
