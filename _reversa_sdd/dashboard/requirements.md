# Unit: Painel Geral (dashboard)

> Especificação de Requisitos do Painel de Controle e Indicadores Gerais da Obra Ativa.

## Visão Geral
Módulo central de visualização executiva e operacional do sistema. Consolida indicadores financeiros, status das etapas da obra, custos acumulados por categoria, limites orçamentários de mão de obra, métricas de produção pré-moldada (trilhos e placas) e atalhos rápidos para operações frequentes.

## Responsabilidades
- Exibir cabeçalho com identificação da obra ativa, data de início e status (em andamento, concluída, cancelada ou planejamento).
- Apresentar cards de KPI consolidados: Custo Total da Obra, Mão de Obra Total (com valor pago e a pagar), Produção (trilhos/placas e custo indicativo) e Total a Pagar pendente.
- Monitorar o teto orçamentário de mão de obra (percentual consumido e saldo remanescente).
- Exibir barra de progresso e detalhamento da etapa atual da obra.
- Apresentar decomposição percentual dos custos por categoria (Materiais, Mão de Obra, Trilhos/Produção, Abastecimentos).
- Fornecer lista de ações e atalhos rápidos para navegação contextual com filtros pré-aplicados.
- Exibir extrato resumido das últimas despesas e diárias lançadas.

## Regras de Negócio
- Todos os cálculos e KPIs são filtrados dinamicamente com base na obra ativa (`activeObra`) 🟢.
- Teto de mão de obra padrão é R$ 32.000,00 caso a obra não possua `tetoMaoDeObra` configurado 🟢.
- O percentual do teto de mão de obra consumido é limitado visualmente em 100% para a barra de progresso (`Math.min(100, ...)`), mas o saldo pode ficar negativo se ultrapassado 🟢.
- A distribuição percentual de categorias divide o subtotal de cada categoria pelo `totalGeralObra`; se o total geral for zero, todos os percentuais exibem 0.0% 🟢.
- Listagens de últimas despesas e diárias recentes mostram no máximo os 4 registros mais recentes ordenados descendentemente por data 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Visualização de KPIs Principais | Must | Exibir Custo Geral, Mão de Obra (paga e pendente), Produção e Contas a Pagar atualizados em tempo real |
| RF-02 | Termômetro de Teto de Mão de Obra | Must | Exibir barra de progresso, total gasto, teto orçado e saldo disponível |
| RF-03 | Acompanhamento da Etapa da Obra | Should | Exibir nome da etapa atual, percentual de conclusão e datas |
| RF-04 | Distribuição de Custos por Categoria | Should | Exibir percentuais e valores de Materiais, Mão de Obra, Produção e Abastecimento |
| RF-05 | Atalhos de Ação Rápida | Should | Navegar diretamente para as abas correspondentes aplicando filtros de contexto |
| RF-06 | Listagem Recente de Despesas e Diárias | Could | Exibir os 4 últimos lançamentos de cada categoria com status e valores formatados |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Renderização reativa a partir do estado global (`useApp`) em memória sem latência de rede | `src/components/dashboard/DashboardView.tsx:21-37` | 🟢 |
| Usabilidade | Formatação estrita de moeda em BRL e datas no padrão brasileiro DD/MM/AAAA | `src/utils/currency.ts`, `src/utils/date.ts` | 🟢 |
| Acessibilidade / Tema | Suporte a modo escuro com classes Tailwind condicionais (`dark:bg-[#111c2d]`) | `src/components/dashboard/DashboardView.tsx:56` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que uma obra está selecionada e possui lançamentos financeiros
Quando o usuário acessa o Dashboard
Então os cards de KPI exibem a soma correta dos valores e o teto de mão de obra reflete os gastos atuais

Dado que o usuário clica em um atalho de ação rápida (ex: "Lançar Despesa")
Quando a ação é disparada
Então o sistema redireciona para a aba de despesas com o contexto pronto para novo lançamento
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cards de Indicadores Financeiros (KPIs) | Must | Visão primordial do gestor sobre o custo e pendências da obra |
| Controle de Teto de Mão de Obra | Must | Limite financeiro crítico da gestão de construção civil |
| Distribuição por Categoria e Etapas | Should | Visibilidade estruturada do andamento e centro de custo |
| Atalhos e Lançamentos Recentes | Could | Conveniência operacional e agilidade na navegação |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/components/dashboard/DashboardView.tsx` | `DashboardView` | 🟢 |
| `src/context/AppContext.tsx` | `totalGeralObra`, `totaisPorCategoria`, `saldoTetoMaoDeObra` | 🟢 |

