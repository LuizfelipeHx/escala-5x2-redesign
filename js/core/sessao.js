/* Login SIMULADO para apresentação. Não há segurança real aqui:
   na versão com servidor, só este arquivo precisa ser trocado.

   Duas visões:
     colaborador  a própria escala
     lideranca    telas de gestão, restritas aos CDDs que a pessoa acompanha
   O cargo (supervisor, coordenador, gerente) é só um rótulo: o que muda o
   alcance é a lista de CDDs, guardada em "unidadeIds". */
(function (E) {
  "use strict";

  const CHAVE = "escala5x2-redesign.sessao";
  const ERRO = "Matrícula ou senha incorretas.";

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo).
  const guardar = (valor) => { try { sessionStorage.setItem(CHAVE, JSON.stringify(valor)); } catch (_) { /* segue sem lembrar */ } };
  const ler = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch (_) { return null; } };
  const apagar = () => { try { sessionStorage.removeItem(CHAVE); } catch (_) { /* nada a fazer */ } };

  let atualEmMemoria = null;

  function buscarUsuario(matricula) {
    const R = E.escala;
    const p = R.porMatricula(matricula);
    if (p) {
      if (!R.ativoEm(p, E.datas.hoje())) return null;
      return { matricula, nome: p.nome, funcao: p.funcao, rota: p.rota, perfil: "colaborador", unidadeIds: [R.unidadeDe(p).id] };
    }
    const l = E.dados.liderancas.find((x) => x.matricula === matricula);
    return l ? { matricula, nome: l.nome, funcao: l.cargo, perfil: "lideranca", unidadeIds: R.unidadesDoLider(l) } : null;
  }

  function entrar(matricula, senha) {
    const usuario = buscarUsuario(String(matricula || "").trim());
    if (!usuario || senha !== E.dados.senhaDemo) return { erro: ERRO };
    atualEmMemoria = usuario;
    guardar(usuario);
    return { usuario };
  }

  function sair() {
    atualEmMemoria = null;
    apagar();
  }

  // Relê o usuário a partir dos dados atuais: se ele foi desligado ou excluído
  // no cadastro, a sessão é encerrada.
  function atual() {
    const salvo = atualEmMemoria || ler();
    if (!salvo) return null;
    const usuario = buscarUsuario(salvo.matricula);
    if (!usuario) { sair(); return null; }
    atualEmMemoria = usuario;
    return usuario;
  }

  const ehLideranca = (usuario) => usuario?.perfil === "lideranca";

  E.sessao = Object.freeze({ entrar, sair, atual, ehLideranca });
})(window.Escala);
