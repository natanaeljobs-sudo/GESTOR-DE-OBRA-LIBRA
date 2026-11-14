# Unit: Gestão de Mão de Obra e Diárias (maodeobra) — Tarefas de Implementação

> Lista de tarefas e contratos operacionais para replicação ou manutenção do módulo de Mão de Obra.

## Tarefas Canônicas

- [ ] **TSK-MO-01** — Modelo de Dados de Trabalhadores e Diárias 🟢
  - *Arquivo de origem:* `src/types/index.ts:92-124`
  - *Critério de pronto:* Definição das interfaces `Trabalhador` e `Diaria` com frações, valores adicionais e estados de pagamento.

- [ ] **TSK-MO-02** — Agrupamento de Diárias por Semanas Civis 🟢
  - *Arquivo de origem:* `src/components/maodeobra/MaoDeObraView.tsx:106-150`, `src/utils/date.ts`
  - *Critério de pronto:* Algoritmo de agrupamento baseado em `getWeekRange()` de segunda a domingo, computando totais pagos e pendentes por semana.

- [ ] **TSK-MO-03** — Card Gerencial do Teto Fechado de Mão de Obra 🟢
  - *Arquivo de origem:* `src/components/maodeobra/MaoDeObraView.tsx:382-513`
  - *Critério de pronto:* Componente com totalizador geral, saldo disponível e barra bi-colorida proporcional a pagos e pendentes.

- [ ] **TSK-MO-04** — Barra de Paginação Deslizante por Semanas (Sliding Window) 🟢
  - *Arquivo de origem:* `src/components/maodeobra/MaoDeObraView.tsx:189-215, 673-777`
  - *Critério de pronto:* Navegação semanal com botões anterior/próximo e janela máxima de 5 botões numéricos com suporte a reticências.

- [ ] **TSK-MO-05** — Modais de Lançamento/Edição de Diárias e Cadastro de Trabalhador 🟢
  - *Arquivo de origem:* `src/components/maodeobra/MaoDeObraView.tsx:216-285`
  - *Critério de pronto:* Modais reativos com seleção de frações (0.5, 1.0, 1.5), preenchimento automático do valor base da diária e toasts de confirmação.

