/* Moldura da área logada: cabeçalho, abas, faixa da unidade, filtros e
   rodapé. É montada uma vez por login; depois só a faixa e o #conteudo
   são redesenhados. */
(function (E) {
  "use strict";

  E.ui.layout = function (usuario, abas, errosDados) {
    const U = E.ui;
    const R = E.escala;
    const onde = usuario.unidadeIds.length > 1
      ? `${usuario.unidadeIds.length} CDDs`
      : R.unidade(usuario.unidadeIds[0]).nome;
    const avisoCarga = E.repositorio.avisoCarga();

    return `
    <header class="topo">
      <div class="topo-in">
        <div class="marca">
          <span class="marca-simbolo" aria-hidden="true">5×2</span>
          <div>
            <p>Equipe de Entrega</p>
            <h1>Escala em dia</h1>
          </div>
        </div>
        <div class="usuario">
          ${U.avatar(usuario.nome)}
          <div class="usuario-info"><b>${U.esc(usuario.nome)}</b><small>${U.esc(usuario.funcao)} · ${U.esc(onde)}</small></div>
          <button class="btn-sair" data-acao="sair">Sair</button>
        </div>
      </div>
    </header>
    <main>
      ${errosDados.length ? `<div class="aviso aviso-erro"><b>Revise os arquivos da pasta dados/</b>${errosDados.map((e) => `<span>${U.esc(e)}</span>`).join("")}</div>` : ""}
      ${avisoCarga ? `<div class="aviso aviso-atencao"><b>Dados de exemplo restaurados</b><span>${U.esc(avisoCarga)}</span></div>` : ""}
      ${abas.length > 1 ? `<nav class="abas" aria-label="Visões">${abas.map((a) => `<button class="aba" data-aba="${a.id}">${a.rotulo}</button>`).join("")}</nav>` : ""}
      <div id="faixa-unidade"></div>
      <div class="filtros oculto" id="filtros">
        <input id="f-busca" type="search" placeholder="Buscar por nome, rota ou matrícula..." autocomplete="off">
        <select id="f-funcao" aria-label="Função">
          <option value="">Todas as funções</option>
          ${R.todasFuncoes().map((f) => `<option>${U.esc(f)}</option>`).join("")}
        </select>
      </div>
      <section id="conteudo"></section>
      <p class="rodape">Protótipo acadêmico (MBL) com dados fictícios. Escala 5x2: 5 dias de trabalho e 2 de folga por semana.</p>
    </main>`;
  };
})(window.Escala);
