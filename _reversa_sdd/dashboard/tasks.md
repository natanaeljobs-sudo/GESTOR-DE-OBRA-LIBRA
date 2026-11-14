# Unit: Painel Geral (dashboard), Tarefas de Implementação

> Sequência de tarefas executáveis para reimplementação do módulo Dashboard.

## Pré-requisitos
- [x] Contexto global da aplicação com agregadores de custos e obras ativas implementado (`AppContext`)
- [x] Utilitários de formatação de moeda (`formatBRL`) e data (`formatDateBR`) disponíveis
- [x] Pacote de ícones `lucide-react` instalado

## Tarefas

- [ ] T-01: Implementar o Banner de Boas-vindas da Obra Ativa
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:56-80`
  - Critério de pronto: Exibir nome da obra, data de início e badge com status visual
  - Confiança: 🟢

- [ ] T-02: Implementar os Cards de KPI Financeiros e de Produção
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:82-190`
  - Critério de pronto: Exibir Custo Geral, Mão de Obra, Produção de Trilhos/Placas e Total a Pagar
  - Confiança: 🟢

- [ ] T-03: Implementar o Termômetro / Medidor do Teto de Mão de Obra
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:192-260`
  - Critério de pronto: Exibir barra percentual consumida (máx 100%), total gasto, teto limite e saldo remanescente
  - Confiança: 🟢

- [ ] T-04: Implementar o Card da Etapa Atual da Obra
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:262-315`
  - Critério de pronto: Exibir nome da etapa em curso, barra de progresso da etapa e datas de início/fim previstas
  - Confiança: 🟢

- [ ] T-05: Implementar a Distribuição Percentual de Custos por Categoria
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:317-390`
  - Critério de pronto: Listar percentuais e valores de Materiais, Mão de Obra, Trilhos e Abastecimentos
  - Confiança: 🟢

- [ ] T-06: Implementar o Painel de Ações Rápidas com Navegação Contextual
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:392-460`
  - Critério de pronto: Botões clicáveis que disparam `navigateToTabWithFilter` para a respectiva tela
  - Confiança: 🟢

- [ ] T-07: Implementar Tabelas de Extratos Recentes (Despesas e Diárias)
  - Origem no legado: `src/components/dashboard/DashboardView.tsx:462-595`
  - Critério de pronto: Exibir os 4 lançamentos mais recentes de cada tipo com formatação correta de status e valor
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01: Teste de renderização do Dashboard com obra ativa preenchida
- [ ] TT-02: Teste de cálculo percentual quando `totalGeralObra` for zero (evitar divisão por zero)
- [ ] TT-03: Teste de estouro do teto de mão de obra (garantir que saldo fique negativo e barra não quebre o layout)
- [ ] TT-04: Teste de clique nos atalhos rápidos acionando `navigateToTabWithFilter`

## Ordem Sugerida
1. T-01 e T-02 (estrutura base e métricas primárias).
2. T-03 e T-05 (indicadores e cálculos derivados).
3. T-04, T-06 e T-07 (etapas, navegação e listagens secundárias).

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica encontrada. A lógica de exibição é totalmente guiada pelo estado global em memória.

