# Tarefas de Reconstrução — Módulo `recibos`

> Tarefas executáveis para implementação do módulo `recibos` a partir das especificações reversas.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## Fila de Implementação

- [ ] **TASK-REC-01** — **Modelagem de Dados e Contexto de Estado** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/types/index.ts`, `src/context/AppContext.tsx`
  - **Descrição:** Implementar a entidade `ReciboPagamento` e as operações de estado: `emitirRecibo`, `updateRecibo` e `deleteRecibo` com flag para estorno de status de diárias.
  - **Critério de Pronto:** Testes unitários validando emissão, cálculo de período/extenso, quitação em lote de diárias e reversão opcional no delete.

- [ ] **TASK-REC-02** — **Serviço de Impressão A4 em 2 Vias (Iframe)** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/utils/reciboPrintService.ts`
  - **Descrição:** Criar rotina isolada de impressão em folha A4 com duas vias idênticas divididas por linha de corte tracejada, garantindo margens exatas para impressão sem quebra indesejada de página.
  - **Critério de Pronto:** Impressão dispara sem recarregar a tela e sem afetar estilos da interface ativa.

- [ ] **TASK-REC-03** — **Painel de Emissão e Seleção de Diárias (`RecibosView`)** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/recibos/RecibosView.tsx`
  - **Descrição:** Construir tela com métricas do topo (Total Emitido, Recibos Emitidos, Diárias em Aberto), filtro de seleção de diárias (Em Aberto / Por Trabalhador / Todas / Por Semana), formulário de emissão (com suporte a trabalhador cadastrado ou avulso) e pré-visualização em tempo real.
  - **Critério de Pronto:** Seleção em lote calcula soma dos valores em tempo real e emite recibo preenchendo todos os metadados.

- [ ] **TASK-REC-04** — **Modal de Pré-visualização Interativa (`ReciboPreviewModal`)** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/recibos/ReciboPreviewModal.tsx`
  - **Descrição:** Implementar modal com controles de zoom (35% a 140%), botão de auto-ajuste à tela, atalho `Esc` para fechamento e acionamento de impressão direta.
  - **Critério de Pronto:** Modal renderiza folha proporcional com alta nitidez e controles responsivos em mobile e desktop.

- [ ] **TASK-REC-05** — **Histórico, Paginação, Busca e Exportação CSV** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/recibos/RecibosView.tsx`
  - **Descrição:** Implementar listagem histórica de recibos com paginação (10 itens/página), busca textual, filtro dropdown por trabalhador, modal de edição rápida do título/número, edição completa de campos e exportação para CSV.
  - **Critério de Pronto:** Tabela permite buscar por qualquer termo, paginar resultados e exportar arquivo `.csv` compatível com Excel.

