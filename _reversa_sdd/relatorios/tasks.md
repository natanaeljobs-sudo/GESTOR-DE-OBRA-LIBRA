# Tarefas de Reconstrução — Módulo `relatorios`

> Tarefas executáveis para implementação do módulo `relatorios` a partir das especificações reversas.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## Fila de Implementação

- [ ] **TASK-REL-01** — **Mecanismo de Unificação e Apuração do Razão (`LedgerItem`)** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/relatorios/RelatoriosView.tsx:142-313`
  - **Descrição:** Implementar hooks e utilitários que recebam os arrays de despesas e diárias, apliquem filtros de período e etapa, unifiquem no formato `LedgerItem` ordenado e calculem os totais e percentuais agregados por categoria.
  - **Critério de Pronto:** Função pura que recebe dados brutos e retorna `AggregateReportData` com 100% de precisão nos centavos.

- [ ] **TASK-REL-02** — **Componente de Filtros de Período com Atalhos e Popover** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/relatorios/RelatoriosView.tsx:41-55, 90-140, 478-558`
  - **Descrição:** Desenvolver popover de seleção de datas com atalhos rápidos (`Mês Atual`, `Últimos 30 Dias`, `Mês Anterior`, `Obra Completa`) e campos de input date para customização.
  - **Critério de Pronto:** Seleção de atalho atualiza o estado de datas e fecha o popover corretamente.

- [ ] **TASK-REL-03** — **Cards Executivos e Gráfico de Barra Empilhada Proporcional** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/relatorios/RelatoriosView.tsx:621-717`
  - **Descrição:** Construir os 3 cards do topo (Total Apurado, Lançamentos, Maior Categoria) e o componente de barra empilhada colorida por categoria de custo.
  - **Critério de Pronto:** Barra reflete as proporções exatas de cada categoria visualmente com legendas e valores em R$.

- [ ] **TASK-REL-04** — **Tabela Paginada com Abas de Categoria e Busca Textual** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/relatorios/RelatoriosView.tsx:315-377, 720-800`
  - **Descrição:** Implementar tabela de lançamentos com abas de categoria (Todos, Materiais, Mão de Obra, Trilhos, Abastecimentos), busca em tempo real e paginação de 10 em 10 itens com elipses.
  - **Critério de Pronto:** Filtro de busca refina a lista instantaneamente sem quebrar a paginação.

- [ ] **TASK-REL-05** — **Exportação CSV e Impressão de Relatório Formatado** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/relatorios/RelatorioObraImpresso.tsx`, `src/utils/relatorioPrintService.ts`
  - **Descrição:** Implementar rotina de geração de arquivo CSV para download e modal com preview de documento impresso oficial da obra (`RelatorioPreviewModal`).
  - **Critério de Pronto:** Download de arquivo CSV legível e acionamento de janela de impressão padrão do navegador.

