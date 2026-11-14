# Unit: Gestão de Cartões e Contas (cartoes) — Tarefas de Implementação

> Lista de tarefas e contratos operacionais para replicação ou manutenção do módulo de Cartões e Parcelas.

## Tarefas Canônicas

- [ ] **TSK-CART-01** — Implementação do modelo de dados e interfaces estendidas de Cartões e Contas 🟢
  - *Arquivo de origem:* `src/types/index.ts`, `src/components/cartoes/CartoesView.tsx:7-15`
  - *Critério de pronto:* Tipos `ExtendedCartao` e `Parcela` devidamente estruturados com suporte a contas PIX e cartões de crédito.

- [ ] **TSK-CART-02** — Construção do Carrossel de Cartões Responsivo com scroll suave e indicador mobile 🟢
  - *Arquivo de origem:* `src/components/cartoes/CartoesView.tsx:718-800`
  - *Critério de pronto:* Exibição de cards visuais com cálculo de faturas abertas, limite, titular e botões de ação (editar/excluir).

- [ ] **TSK-CART-03** — Implementação da Tabela de Parcelas com Filtro Temporal e Paginação 🟢
  - *Arquivo de origem:* `src/components/cartoes/CartoesView.tsx:331-356`
  - *Critério de pronto:* Filtro por "Todo o Período" e "Mês / Ano", com paginação de 5 itens por página e exibição de totais (a vencer e quitado).

- [ ] **TSK-CART-04** — Criação dos Modais de Cadastro de Cartão/Conta e Edição/Exclusão 🟢
  - *Arquivo de origem:* `src/components/cartoes/CartoesView.tsx:398-540`
  - *Critério de pronto:* Formulários modais funcionais para inclusão, edição e deleção de cartões e parcelas com confirmação visual e toast notifications.

- [ ] **TSK-CART-05** — Integração com Alertas de Compras Pendentes de Vínculo 🟢
  - *Arquivo de origem:* `src/components/cartoes/CartoesView.tsx:569-586`
  - *Critério de pronto:* Banner funcional no topo redirecionando para a aba de despesas com filtro `nao_informado`.

