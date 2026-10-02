# Histórico e calendário de risco demonstrativos

Implementado em 02/10/2026 no repositório paralelo escala-5x2-redesign.

As abas Absenteísmo e Calendário de risco aparecem para supervisão, coordenação e gerência, respeitando o seletor de CDDs do protótipo. O acesso continua simulado.

- Histórico sintético reproduzível: janeiro/2025 a setembro/2026, 60 pessoas fictícias por CDD, independente dos nomes, ocorrências e jornadas do cadastro. Não representa AFDT importado.
- Comparações do mês selecionado com os três anteriores e o mesmo mês do ano anterior; agrupamentos segunda a sábado e semanas 1–7, 8–14, 15–21, 22–28, 29–31.
- Taxa: faltas / (presenças + faltas) em pessoas-dias. Justificativas e folgas ficam fora dos previstos; falhas de ponto permanecem previstas mas fora da taxa até conferência. A cobertura dos dados exibe essa diferença.
- Calendário inicial: novembro/2026. O cálculo usa apenas meses anteriores ao alvo, nos três meses mais recentes disponíveis e no mesmo mês do ano anterior. São comparados dia da semana e faixa do mês. Fontes são unidas sem duplicação.
- Semáforo ilustrativo: baixo <3%; atenção 3–5%; alto >5%. Exige 60 pessoas-dias avaliadas em pelo menos duas datas. Domingos e amostra insuficiente aparecem sem base.
- Cada dia mostra datas, faltas, denominadores, cobertura e sugestão de acompanhamento. Não há previsão individual nem índice Bradford.

O cenário inclui deliberadamente uma concentração de faltas nas quintas-feiras dos dias 15–21 para demonstrar o planejamento preventivo. Não há inferência sobre pessoas reais.

## Limites

Não implementa leitor de AFDT, histórico de vigência real das jornadas, banco compartilhado ou autenticação real. Para produção, esses componentes e os limiares precisam de validação. Os dados demonstrativos não entram no cadastro nem nas regras operacionais existentes.

## Verificação

`node tests/absenteismo.cjs` verifica reconciliação, taxas, falta de dados, corte temporal, evidências e reprodução. `testes.html` mantém os testes das regras e do cadastro originais.
