# Escala em dia · Redesign

Versão independente de `LuizfelipeHx/escala-5x2`. Inclui as abas **Absenteísmo** e **Calendário de risco**, com histórico inteiramente fictício para apresentação. Consulte [metodologia e limites](docs/ABSENTEISMO-DEMO.md).

Protótipo de um site para as equipes de entrega consultarem a escala 5x2 (5 dias de trabalho e 2 de folga por semana) em **4 CDDs com 3 tipos de escala**.

Projeto acadêmico do MBL, voltado para a operação Ambev. **Todos os nomes e dados são fictícios.**

## Como abrir

**Online (quando o GitHub Pages estiver habilitado):** https://luizfelipehx.github.io/escala-5x2-redesign/

Funciona no celular e no computador. Testes automáticos: `testes.html` e `node tests/absenteismo.cjs`.

**No computador, sem internet:** baixe a pasta e dê dois cliques em `index.html` (Chrome ou Edge).

> O site publicado é público e usa **apenas dados fictícios**. Não cadastre nomes ou dados reais nesta versão: para isso é preciso login de verdade (Fase 2 em `docs/ROADMAP.md`).

## Unidades e tipos de escala

| CDD | Tipo | Como funciona |
|---|---|---|
| Mauá (SP) | **Rotativa** | As 2 folgas são dias seguidos e avançam 1 dia por semana (Seg+Ter, Ter+Qua, ...). Ciclo de 7 semanas. |
| Vitória (ES) | **Fixa** | As folgas são sempre nos mesmos dias. Só mudam quando entra alguém novo. |
| Paranaguá (PR) | **Mensal** | A supervisão publica as folgas de cada mês. Mês não publicado aparece como "a publicar". |
| Curitiba (PR) | **Mensal** | Igual a Paranaguá. |

## Acessos de demonstração

A senha de todos é **1234**. Digite a matrícula e a senha na tela de login.

O site tem **duas visões**: **Liderança** e **Colaborador**. Na liderança, todos veem as mesmas telas; o que muda é quais CDDs cada pessoa acompanha. O cargo é só um rótulo.

| Visão | Matrícula | Cargo | CDDs que acompanha |
|---|---|---|---|
| Liderança | 90000 | Gerente regional | Os 4 |
| Liderança | 80001 / 80002 | Coordenação | Mauá e Vitória / Paranaguá e Curitiba |
| Liderança | 91001 / 92001 / 93001 / 94001 | Supervisão | Mauá / Vitória / Paranaguá / Curitiba |
| Colaborador | 10001 a 10006 Mauá, 20001 a 20006 Vitória, 30001 a 30006 Paranaguá, 40001 a 40006 Curitiba | Motorista ou ajudante | Só a própria escala |

> O login é **simulado**, só para mostrar o fluxo. Ele não protege os dados. A tela de login não lista os acessos (para ter a aparência da versão final): repasse ao time os acessos desta tabela.

> **Imagem do login:** foto da marca Corona, usada a pedido do time Ambev, para quem o projeto é feito. Uso interno do protótipo; não reutilizar fora dele.

## O que cada visão mostra

**Colaborador:** se trabalha ou folga hoje, a próxima folga, o próximo domingo de folga, como está o parceiro de rota e o calendário do mês.

**Liderança:**
- **Visão geral** (quando acompanha mais de um CDD): um cartão por CDD com operação de hoje, alertas de cobertura, pessoas sem domingo de folga e publicação da escala do próximo mês.
- **Hoje:** quem está em operação e quem está fora, com alerta se faltar gente.
- **Semana:** grade da equipe de segunda a domingo, com o total por função.
- **Cobertura:** 28 dias à frente, dias abaixo do mínimo, dias a publicar e quem folga nos próximos domingos.
- **Escala individual:** o calendário de qualquer colaborador. Também abre ao clicar no nome.
- **Cadastro:** tipo de jornada do CDD, equipe (com PIS/CPF, admissão e desligamento), escala de cada pessoa e ocorrências.

## Cadastro

- **Tipo de jornada do CDD:** fixa, rotativa ou mensal, e a cobertura mínima por função. É o que separa folga de falta nas análises.
- **Equipe:** incluir, editar, desligar (mantém o histórico) ou excluir (só para cadastro errado). O PIS/CPF é validado pelo dígito verificador e serve para cruzar com o arquivo de ponto (AFDT).
- **Ocorrências:** férias, atestado, afastamento e falta injustificada. **Só a falta conta como absenteísmo.** Falta só pode ser lançada em dia de trabalho da escala.

> **Onde fica salvo:** nesta versão, o que você cadastra fica **só no seu navegador**. Quem abrir o site em outro aparelho vê os dados de exemplo. Use "Exportar dados" e "Importar dados" para levar o cadastro de um navegador para outro, e "Restaurar dados de exemplo" para recomeçar.

> **Dados reais:** o site está publicado num endereço público. Não cadastre pessoas reais nem coloque arquivos de ponto reais na pasta do projeto: o `.gitignore` bloqueia arquivos `.txt`, `.afd` e `.afdt` fora da pasta `exemplos/`.

## Como alterar os dados de exemplo

Os dados de exemplo ficam na pasta `dados/`:

- `dados/geral.js`: senha de demonstração, liderança (cargo e CDDs que acompanha) e feriados.
- `dados/unidades/<cdd>.js`: um arquivo por CDD, com equipe, ocorrências e as regras daquele tipo de escala. Cada arquivo explica no topo como preencher.

Depois de editar, abra `testes.html` para conferir as regras. Se algo estiver errado nos dados, o próprio site mostra um aviso vermelho dizendo o CDD e a pessoa.

## Estrutura

```
index.html              página do site
testes.html             testes automáticos (31 testes)
dados/geral.js          dados comuns de exemplo
dados/unidades/         um arquivo de exemplo por CDD
css/                    estilos (base, componentes, telas)
img/                    foto do login e ícone da aba
js/core/datas.js        utilitários de data
js/core/documentos.js   validação de PIS e CPF
js/core/regras/         uma regra por tipo de escala (fixa, rotativa, mensal)
js/core/escala.js       regras comuns: quadro ativo, ausências, cobertura, alertas
js/core/repositorio.js  leitura e gravação dos dados (hoje: navegador)
js/core/sessao.js       login simulado e perfis
js/ui/                  peças de interface reaproveitadas
js/telas/               uma tela por arquivo
js/app.js               estado, navegação e cliques
docs/                   documentação técnica
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md): como o código está organizado e por quê.
- [Módulos](docs/MODULES.md): o que cada arquivo faz.
- [Roadmap](docs/ROADMAP.md): próximas fases.
- [TODO](docs/TODO.md): pendências.
- [Devlog](docs/DEVLOG.md): histórico das mudanças.
