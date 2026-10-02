(function (E) {
  "use strict";
  const D = E.datas, A = E.absenteismo, U = E.ui;
  const pct = (n) => n === null ? "Sem base" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  const nomeMes = (m) => D.mesAno(D.deIso(`${m}-01`));
  const niveis = { baixo: "Baixo", atencao: "Atenção", alto: "Alto", "sem-base": "Sem base" };
  const aviso = () => `<div class="demo-aviso"><b>DEMONSTRAÇÃO · DADOS FICTÍCIOS</b><span>60 pessoas sintéticas por CDD, independentes do cadastro. Janeiro/2025 a setembro/2026. Nenhum AFDT foi importado.</span></div>`;
  function metodologia() {
    return `<details class="analise-metodo"><summary>Como os números e sinais são calculados</summary>
      <p>A demonstração considera segunda a sábado. Cada pessoa tem dois dias de folga por semana em uma escala hipotética. As jornadas e os nomes do cadastro não são usados neste histórico sintético.</p>
      <p><b>Taxa = faltas injustificadas ÷ pessoas-dias previstas com situação conferida × 100.</b> Uma pessoa prevista em cinco dias representa cinco pessoas-dias. Folgas, férias, atestados e afastamentos são separados antes da contagem. Falhas de ponto ficam pendentes de conferência e são excluídas do denominador, sem virar falta. A cobertura informa quanto dos previstos pôde ser avaliado.</p>
      <p>Semana do mês: 1 = dias 1–7; 2 = 8–14; 3 = 15–21; 4 = 22–28; 5 = 29–31. O calendário combina o mesmo dia da semana e faixa do mês nos três últimos meses disponíveis anteriores ao mês escolhido e no mesmo mês do ano anterior. Soma faltas e pessoas-dias, sem fazer média simples dos percentuais e sem duplicar registros.</p>
      <p>Faixas demonstrativas: baixo &lt; 3%; atenção de 3% a 5%; alto &gt; 5%. Só há sinal com pelo menos 60 pessoas-dias avaliadas em duas datas históricas. Base insuficiente aparece em cinza. Os limiares ainda precisam de validação operacional.</p>
      <p>O percentual é uma frequência histórica ilustrativa, não a probabilidade de uma pessoa faltar. A base termina em setembro/2026; meses posteriores não acrescentam observações. Sem histórico, o sistema não presume risco zero.</p>
    </details>`;
  }
  function tabelaGrupos(titulo, grupos) {
    return `<article class="painel"><h3>${titulo}</h3><div class="analise-grupos">${grupos.map(([nome, registros]) => {
      const r = A.resumir(registros);
      return `<div class="analise-linha"><div><b>${nome}</b><small>${r.faltas} faltas / ${r.avaliados} pessoas-dias</small></div><div class="analise-barra"><i style="width:${Math.min(r.taxa || 0, 100)}%"></i></div><strong>${pct(r.taxa)}</strong></div>`;
    }).join("")}</div></article>`;
  }
  function historico(estado) {
    const id = estado.unidadeId, mes = estado.mesHistorico;
    const registros = A.historico(id, mes), r = A.resumir(registros);
    const meses = [...new Set(A.gerar(id).map(x => x.mes))].reverse();
    const ref = D.deIso(`${mes}-01`);
    const comparacoes = [0, -1, -2, -3, -12].map(n => D.chaveMes(D.addMeses(ref, n)));
    return `${aviso()}<div class="ctrl"><div><p class="analise-sobretitulo">Histórico de absenteísmo</p><h2 class="titulo-data">Onde as ausências se concentram</h2></div><label class="campo">Mês de referência<select id="historico-mes">${meses.map(m => `<option value="${m}"${m === mes ? " selected" : ""}>${nomeMes(m)}</option>`).join("")}</select></label></div>
      <div class="resumo resumo-4">${U.kpi("Faltas injustificadas", r.faltas, "k-atestado")}${U.kpi("Taxa no mês", pct(r.taxa), "k-folga")}${U.kpi("Pessoas-dias avaliadas", r.avaliados, "", `${r.previstos} previstas após justificativas`)}${U.kpi("Cobertura dos registros", pct(r.cobertura), "k-trabalho", `${r.falhas} falhas de ponto a conferir`)}</div>
      <div class="colunas">${tabelaGrupos("Por dia da semana", [1,2,3,4,5,6].map(n => [D.NOMES_DIA[n], registros.filter(x => x.dia === n)]))}${tabelaGrupos("Por semana do mês", [1,2,3,4,5].map(n => [`Semana ${n} · ${1 + (n-1)*7}–${Math.min(n*7,D.diasNoMes(ref))}`, registros.filter(x => x.semana === n)]).filter((_, i) => i*7 < D.diasNoMes(ref)))}</div>
      <h3 class="secao">Comparação com meses anteriores</h3><div class="tabela-wrap"><table><thead><tr><th>Período</th><th>Faltas</th><th>Pessoas-dias avaliadas</th><th>Taxa</th><th>Diferença para referência</th></tr></thead><tbody>${comparacoes.map((m,i) => {
        const x = A.resumir(A.historico(id,m));
        const diferenca = r.taxa !== null && x.taxa !== null ? r.taxa - x.taxa : null;
        return `<tr><td>${nomeMes(m)}${i === 4 ? " · ano anterior" : i === 0 ? " · referência" : ""}</td><td>${x.dias ? x.faltas : "Sem base"}</td><td>${x.avaliados}</td><td>${pct(x.taxa)}</td><td>${i === 0 ? "Referência" : diferenca === null ? "Sem base" : `${diferenca > 0 ? "+" : ""}${diferenca.toLocaleString("pt-BR",{maximumFractionDigits:1})} p.p.`}</td></tr>`;
      }).join("")}</tbody></table></div><p class="nota">Diferença = taxa do mês de referência menos a taxa do período comparado.</p>
      <div class="analise-exclusoes"><b>Situações separadas das faltas</b><span>${r.folgas} folgas</span><span>${r.ferias} férias</span><span>${r.atestados} atestados</span><span>${r.afastamentos} afastamentos</span><span>${r.falhas} falhas de ponto</span></div>${metodologia()}`;
  }
  function calendario(estado) {
    const mes = D.deIso(`${estado.mesRisco}-01`), id = estado.unidadeId;
    const dias = Array.from({length:D.diasNoMes(mes)},(_,i) => {
      const d = new Date(mes.getFullYear(),mes.getMonth(),i+1);
      return { d, r:A.risco(id,d) };
    });
    const selecionado = dias.find(x => D.iso(x.d) === estado.diaRisco) || dias.find(x => x.r.nivel === "alto") || dias[0];
    const f = A.fontes(id,mes);
    const recentes = f.recentes.map(nomeMes).join(", ") || "Sem meses disponíveis";
    return `${aviso()}<div class="ctrl"><div><p class="analise-sobretitulo">Planejamento da liderança</p><h2 class="titulo-data">Calendário de risco · ${nomeMes(estado.mesRisco)}</h2></div><div class="ctrl-botoes"><button class="btn" data-acao="risco-ant" aria-label="Mês anterior">‹</button><input id="risco-mes" type="month" min="2025-01" max="2027-12" value="${estado.mesRisco}" aria-label="Mês do calendário"><button class="btn" data-acao="risco-prox" aria-label="Mês seguinte">›</button></div></div>
      <p class="nota">Clique em um dia para entender o sinal. Base recente: ${recentes}. Comparação sazonal: ${nomeMes(f.anterior)}${f.registros.some(x => x.mes === f.anterior) ? "" : " (sem dados)"}.</p>
      <div class="risco-legenda">${Object.entries(niveis).map(([k,v])=>`<span class="risco-pill risco-${k}">${v}${k === "alto" ? " > 5%" : k === "baixo" ? " < 3%" : k === "atencao" ? " 3–5%" : ""}</span>`).join("")}</div>
      <div class="risco-layout"><div class="risco-cal" aria-label="Calendário de sinais históricos">${["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(x=>`<div class="cal-cab">${x}</div>`).join("")}${'<div aria-hidden="true"></div>'.repeat((mes.getDay()+6)%7)}${dias.map(({d,r})=>`<button class="risco-dia risco-${r.nivel}" data-acao="risco-dia" data-dia="${D.iso(d)}" aria-pressed="${D.mesmoDia(d,selecionado.d)}" aria-label="${D.extenso(d)}: ${d.getDay() === 0 ? "domingo fora da análise" : niveis[r.nivel] + (r.suficiente ? ", " + pct(r.taxa) : "")}"><b>${d.getDate()}</b><span>${d.getDay() === 0 ? "Domingo" : niveis[r.nivel]}</span><strong>${r.suficiente ? pct(r.taxa) : "—"}</strong></button>`).join("")}</div>
      <aside class="painel risco-detalhe" aria-live="polite"><p class="analise-sobretitulo">Por que este sinal?</p><h3>${D.extenso(selecionado.d)}</h3>${detalhe(selecionado.d,selecionado.r)}</aside></div>${metodologia()}`;
  }
  function detalhe(d,r) {
    if (d.getDay() === 0) return '<p>Domingos ficam fora desta análise, que cobre segunda a sábado.</p>';
    return `<span class="risco-pill risco-${r.nivel}">${niveis[r.nivel]}${r.suficiente ? ` · ${pct(r.taxa)}` : ""}</span><p>${r.suficiente ? "Frequência histórica na amostra comparável." : "Amostra insuficiente para sinalizar risco."} ${D.NOMES_DIA[d.getDay()]} da semana ${A.semana(d)} do mês.</p>
      <div class="risco-amostra"><b>${r.faltas}</b> faltas em <b>${r.avaliados}</b> pessoas-dias avaliadas, distribuídas em <b>${r.dias}</b> datas.</div><p class="nota">${r.previstos} previstas após justificativas · ${r.falhas} falhas excluídas · cobertura ${pct(r.cobertura)}.</p>
      <ul class="risco-fontes">${r.registros.map(x=>`<li><b>${D.curto(D.deIso(x.data))}/${D.deIso(x.data).getFullYear()}</b><span>${x.faltas} faltas / ${x.presencas+x.faltas} avaliadas</span></li>`).join("") || "<li>Nenhuma data comparável disponível.</li>"}</ul>
      <div class="risco-acao"><b>Ação sugerida</b><p>${r.nivel === "alto" ? "Revisar a cobertura e a disponibilidade de substitutos. Conversar com a equipe sobre obstáculos à presença." : r.nivel === "atencao" ? "Acompanhar a cobertura e conferir as ocorrências antes de fechar a programação." : r.nivel === "baixo" ? "Manter o acompanhamento habitual. Sinal baixo não garante ausência de faltas." : "Ampliar o histórico e conferir os registros antes de usar uma estimativa."}</p></div><p class="nota">Sinal coletivo de acompanhamento. Não indica que um funcionário específico faltará.</p>`;
  }
  E.telas.historico = { render:historico };
  E.telas.risco = { render:calendario };
})(window.Escala);
