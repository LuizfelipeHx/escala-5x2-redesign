/* Tela de login (simulado). Os acessos de demonstração ficam no README,
   não na tela, para o login ter a aparência da versão final. */
(function (E) {
  "use strict";

  E.telas = E.telas || {};

  // Ícones em linha (SVG), herdam a cor do texto.
  const svg = (caminho) =>
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${caminho}</svg>`;
  const ICONES = {
    pessoa: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
    cadeado: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    olho: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    olhoFechado: svg('<path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10.6 10.6 0 0 0 5.4-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  };

  // Alterna senha visível/oculta (chamado pelo app.js no botão do olho).
  function alternarSenha(botao) {
    const campo = botao.closest(".campo-icone").querySelector("input");
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    botao.innerHTML = mostrar ? ICONES.olhoFechado : ICONES.olho;
    botao.setAttribute("aria-label", mostrar ? "Esconder senha" : "Mostrar senha");
  }

  E.telas.login = {
    alternarSenha,

    render() {
      return `<div class="login-pagina">
        <div class="login-foto" aria-hidden="true"></div>
        <div class="login-card">
          <div class="login-marca">
            <span class="login-simbolo" aria-hidden="true">5×2</span>
            <h1>Escala em dia</h1>
            <p>Equipe de Entrega</p>
          </div>
          <p class="login-chamada">Acesse sua escala e a cobertura da operação.</p>

          <form id="form-login" autocomplete="off" novalidate>
            <label class="campo-icone">
              <span class="visualmente-oculto">Matrícula</span>
              ${ICONES.pessoa}
              <input name="matricula" inputmode="numeric" placeholder="Matrícula" required>
            </label>
            <label class="campo-icone">
              <span class="visualmente-oculto">Senha</span>
              ${ICONES.cadeado}
              <input name="senha" type="password" placeholder="Senha" required>
              <button type="button" class="ver-senha" data-acao="ver-senha" aria-label="Mostrar senha">${ICONES.olho}</button>
            </label>
            <p class="login-erro" id="login-erro" role="alert"></p>
            <button class="btn btn-primario btn-largo" type="submit">Entrar</button>
          </form>

          <p class="login-nota">Protótipo com dados fictícios.</p>
        </div>
      </div>`;
    },
  };
})(window.Escala);
