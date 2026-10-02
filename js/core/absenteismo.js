/* Demonstração independente do cadastro: 60 pessoas sintéticas por CDD.
   Não lê AFDT nem transforma dados cadastrados em histórico observado. */
(function (E) {
  "use strict";
  const D = E.datas;
  const INICIO = "2025-01-01", FIM = "2026-09-30";
  const cache = new Map();
  const semana = (d) => Math.ceil(d.getDate() / 7);
  const chaves = ["previstos", "presencas", "faltas", "ferias", "atestados", "afastamentos", "falhas", "folgas"];
  function gerar(unidade) {
    if (cache.has(unidade)) return cache.get(unidade);
    let seed = [...unidade].reduce((n, c) => n * 31 + c.charCodeAt(0), 23) >>> 0;
    const sorteio = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const registros = [];
    for (let d = D.deIso(INICIO); D.iso(d) <= FIM; d = D.addDias(d, 1)) {
      const r = { data: D.iso(d), mes: D.chaveMes(d), dia: d.getDay(), semana: semana(d), ...Object.fromEntries(chaves.map(k => [k, 0])) };
      // Hipótese de escala 5x2 sintética, com pares de folga distribuídos.
      const taxa = .015 + (r.dia === 1 ? .035 : 0) + (r.dia === 4 && r.semana === 3 ? .115 : 0) + (d.getMonth() === 10 ? .02 : 0);
      for (let p = 0; p < 60; p++) {
        if (r.dia === p % 7 || r.dia === (p + 1) % 7) { r.folgas++; continue; }
        const a = sorteio();
        if (a < .035) { r.ferias++; continue; }
        if (a < .055) { r.atestados++; continue; }
        if (a < .065) { r.afastamentos++; continue; }
        r.previstos++;
        if (a < .085) r.falhas++;
        else if (sorteio() < taxa) r.faltas++;
        else r.presencas++;
      }
      registros.push(Object.freeze(r));
    }
    cache.set(unidade, Object.freeze(registros));
    return cache.get(unidade);
  }
  function resumir(registros) {
    const r = Object.fromEntries(chaves.map(k => [k, registros.reduce((n, x) => n + x[k], 0)]));
    r.dias = registros.length;
    r.avaliados = r.presencas + r.faltas;
    // Falhas de ponto continuam previstas, mas não entram na taxa até conferência.
    r.taxa = r.avaliados ? 100 * r.faltas / r.avaliados : null;
    r.cobertura = r.previstos ? 100 * r.avaliados / r.previstos : null;
    return r;
  }
  function historico(unidade, mes) {
    return gerar(unidade).filter(r => r.mes === mes && r.dia !== 0);
  }
  function fontes(unidade, mes) {
    const inicioAlvo = D.chaveMes(mes);
    const anterior = D.chaveMes(D.addMeses(mes, -12));
    const todos = gerar(unidade).filter(r => r.mes < inicioAlvo && r.dia !== 0);
    const recentes = [...new Set(todos.map(r => r.mes))].sort().slice(-3);
    // Evita duplicação se uma série muito curta tiver o mesmo mês nas duas fontes.
    return {
      recentes,
      anterior,
      registros: todos.filter(r => recentes.includes(r.mes) || r.mes === anterior),
    };
  }
  function risco(unidade, d) {
    const f = fontes(unidade, D.inicioDoMes(d));
    const registros = d.getDay() === 0 ? [] : f.registros.filter(r => r.dia === d.getDay() && r.semana === semana(d));
    const resumo = resumir(registros);
    const suficiente = resumo.dias >= 2 && resumo.avaliados >= 60;
    const nivel = !suficiente ? "sem-base" : resumo.taxa < 3 ? "baixo" : resumo.taxa <= 5 ? "atencao" : "alto";
    return { ...resumo, nivel, registros, fontes: f, suficiente };
  }
  E.absenteismo = Object.freeze({ INICIO, FIM, semana, gerar, resumir, historico, fontes, risco });
})(window.Escala);
