# Roadmap

## Versão paralela: demonstração de absenteísmo (02/10/2026)

As abas de análise histórica e calendário de risco estão implementadas com dados sintéticos, comparativos e evidência por dia. Isso antecipa a demonstração visual das etapas 3 e 4, mas a integração com AFDT continua pendente. Ver [metodologia e limites](ABSENTEISMO-DEMO.md).

## Fase 0: Esboço (feito)

- [x] Consulta de escala com dados fictícios, publicada no GitHub Pages
- [x] 4 CDDs com 3 tipos de escala (rotativa, fixa, mensal)
- [x] Login simulado com perfis
- [x] Férias, atestados e feriados; alerta de cobertura e de domingo
- [x] Testes automáticos das regras

## Fase 1: Absenteísmo (em andamento)

Plano aprovado em 02/10/2026, entregue por etapas com aprovação entre elas.

| Etapa | Entrega | Situação |
|---|---|---|
| 1. Cadastro | Jornada do CDD, equipe com PIS/CPF, escala por pessoa, ocorrências, visões Liderança e Colaborador | ✅ v0.5 e v0.6 |
| 2. Importação do AFDT | Ler arquivos de ponto (layout oficial, PIS ou CPF) e classificar cada dia: presença, falta, folga, ausência justificada, falha de registro. AFDTs fictícios de jul/2025 a set/2026 | ⏳ |
| 3. Análise histórica | Ausência por dia da semana (seg a sáb) e por semana do mês; meses anteriores; mesmo mês do ano anterior; faltas e % sobre os previstos | ⏳ |
| 4. Calendário de risco e por funcionário | Mês futuro com dias verde/amarelo/vermelho e o histórico que sustenta cada sinal; recorrência por pessoa (% + Bradford), sempre como sinal para acompanhamento | ⏳ |
| 5. Visual | Ícones e logo própria, barra inferior no celular, mini gráficos, modo escuro e transições | ⏳ |

Regras já decididas:
- Só falta injustificada pontua no risco. Férias, atestado e afastamento aparecem no histórico, mas não pontuam.
- Risco por pessoa = % de ausência nos últimos 90 dias + fator de Bradford.
- Dias sem escala conhecida ficam fora das contas (não viram falta).
- AFDT é lido só no navegador; arquivo real nunca vai para o repositório.

## Fase 2: Piloto

- Validar o leitor de AFDT com um arquivo real dos relógios dos CDDs
- Banco de dados compartilhado (ex.: Supabase) e login real por matrícula
- Supervisor montando e publicando a escala mensal pelo site
- Instalar no celular como aplicativo (PWA)

## Fase 3: Produção

- Integração automática com o sistema de ponto e de RH
- Pedido de troca de folga com aprovação
- Avisos de próxima folga e de mudança de escala
- Auditoria de alterações e adequação completa à LGPD
