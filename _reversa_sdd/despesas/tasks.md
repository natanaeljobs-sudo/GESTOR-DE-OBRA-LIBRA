# Unit: Gestão de Despesas e Rateio de Notas (despesas) — Tarefas de Implementação

> Lista de tarefas e contratos operacionais para replicação ou manutenção do módulo de Despesas.

## Tarefas Canônicas

- [ ] **TSK-DESP-01** — Estrutura de dados das Notas Fiscais e Itens Rateados 🟢
  - *Arquivo de origem:* `src/types/index.ts:46-83`
  - *Critério de pronto:* Interfaces `Despesa` e `ItemDespesa` tipadas com suporte a categorias, destinos de item e conferência de rateio.

- [ ] **TSK-DESP-02** — Listagem de Notas Fiscais com Visualização de Sub-Itens e Badges de Status 🟢
  - *Arquivo de origem:* `src/components/despesas/DespesasView.tsx:325-451`
  - *Critério de pronto:* Renderização de cards de despesas com exibição dos itens discriminados, cálculo de diferença de rateio e links para comprovantes externos.

- [ ] **TSK-DESP-03** — Barra de Busca Global e Filtros por Categoria e Etapa Construtiva 🟢
  - *Arquivo de origem:* `src/components/despesas/DespesasView.tsx:269-324`
  - *Critério de pronto:* Filtragem em tempo real sobre texto livre, categoria da despesa e etapa com totalizador dinâmico de valores filtrados.

- [ ] **TSK-DESP-04** — Modal Completo de Lançamento e Edição de Despesa com Cálculo em Tempo Real 🟢
  - *Arquivo de origem:* `src/components/despesas/DespesasView.tsx:453-616, 688-800`
  - *Critério de pronto:* Formulário modal com adição/remoção de itens dinâmicos, atualização de subtotais e cálculo visual da diferença de conferência.

- [ ] **TSK-DESP-05** — Criação Rápida Inline de Materiais no Catálogo 🟢
  - *Arquivo de origem:* `src/components/despesas/DespesasView.tsx:161-176, 642-686`
  - *Critério de pronto:* Sub-formulário expansível que insere novo material no `AppContext` e já vincula ao item corrente sem fechar a modal.

