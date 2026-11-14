# Requisitos — Módulo `recibos`

> Especificação de requisitos do módulo de emissão, visualização e impressão de recibos de mão de obra.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## 1. Visão Geral

- **Módulo:** `recibos`
- **Caminho no Legado:** `src/components/recibos/RecibosView.tsx`, `src/components/recibos/ReciboPreviewModal.tsx`, `src/utils/reciboPrintService.ts`
- **Propósito:** Emissão formal de recibos de pagamento com duas vias em folha A4 (pagador e recebedor), liquidação opcional de diárias pendentes, controle de histórico com filtros/busca, edição rápida e geração de impressão direta ou exportação em CSV.
- **Nível de Confiança Geral:** 🟢 CONFIRMADO (código-fonte React/TypeScript analisado diretamente).

---

## 2. Requisitos Funcionais (RF)

| ID | Descrição | Prioridade (MoSCoW) | Confiança | Rastreabilidade no Código |
|---|---|---|---|---|
| **RF-01** | Sugerir e permitir customizar identificador sequencial de recibo no formato `REC-AAAA-NNN` | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:48-61` |
| **RF-02** | Suportar seleção de trabalhador cadastrado ou inserção avulsa de trabalhador manual (Nome, CPF opcional, Função) | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:63-68, 207-212, 221-231` |
| **RF-03** | Seleção individual e em lote de diárias por filtros: Em Aberto (`pendente`), Do Trabalhador ou Todas, e filtro por semana | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:148-198` |
| **RF-04** | Emitir recibo consolidado calculando valor total e gerando valor por extenso automaticamente | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:215-267`, `utils/currency.ts` |
| **RF-05** | Permitir marcar automaticamente as diárias vinculadas como `pago` no momento da emissão | **Should** | 🟢 CONFIRMADO | `RecibosView.tsx:78, 255`, `AppContext.tsx:emitirRecibo` |
| **RF-06** | Exibir pré-visualização em tela com layout A4 de 2 vias (Pagador e Recebedor) com linha de corte horizontal tracejada | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:528-610`, `ReciboPreviewModal.tsx:246-265` |
| **RF-07** | Modal interativo de visualização com zoom ajustável (35% a 140%), auto-fit para telas mobile e impressão dedicada | **Should** | 🟢 CONFIRMADO | `ReciboPreviewModal.tsx:30-59, 290-330` |
| **RF-08** | Acionamento de impressão via iframe isolado sem poluir a interface principal (`reciboPrintService`) | **Must** | 🟢 CONFIRMADO | `reciboPrintService.ts:1-120` |
| **RF-09** | Edição rápida de nome/identificação do recibo e edição completa de todos os campos de recibos já emitidos | **Should** | 🟢 CONFIRMADO | `RecibosView.tsx:93-122, 328-405` |
| **RF-10** | Exclusão de recibo com opção de reverter o status das diárias associadas para `pendente` | **Should** | 🟢 CONFIRMADO | `RecibosView.tsx:124-126, 408-420`, `AppContext.tsx:deleteRecibo` |
| **RF-11** | Tabela de histórico de recibos com busca por termo, filtro por trabalhador e paginação (10 itens/página) | **Must** | 🟢 CONFIRMADO | `RecibosView.tsx:432-489` |
| **RF-12** | Exportação de recibos filtrados em formato CSV contendo todos os metadados do documento | **Could** | 🟢 CONFIRMADO | `RecibosView.tsx:491-516` |
| **RF-13** | Cópia rápida do texto formatado do recibo para a área de transferência | **Could** | 🟢 CONFIRMADO | `RecibosView.tsx:305-325` |

---

## 3. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição | Confiança | Evidência |
|---|---|---|---|---|
| **RNF-01** | **Fidelidade Gráfica** | Impressão dimensionada exatamente para papel A4 retrato (210mm x 297mm) com quebra de página precisa e 2 vias independentes | 🟢 CONFIRMADO | `reciboPrintService.ts`, CSS `@page { size: A4 portrait; margin: 8mm; }` |
| **RNF-02** | **Desempenho / Usabilidade** | A renderização de impressão deve ser assíncrona usando iframe invisível para não bloquear o ciclo de vida do DOM da aplicação | 🟢 CONFIRMADO | `triggerReciboInPagePrint` cria iframe, injeta CSS e remove após impressão |
| **RNF-03** | **Responsividade** | A visualização prévia deve se adaptar dinamicamente ao viewport de dispositivos móveis com escala proporcional (0.38x a 1.1x) | 🟢 CONFIRMADO | `ReciboPreviewModal.tsx:47-59` |
| **RNF-04** | **Integridade de Dados** | A exclusão de um recibo emitido deve permitir a restauração transacional do estado financeiro das diárias vinculadas | 🟢 CONFIRMADO | `deleteRecibo(id, restaurarDiarias)` em `AppContext` |

---

## 4. Critérios de Aceitação (Gherkin)

### Cenário 1: Emissão de recibo a partir de diárias em aberto
- **Dado** que existem diárias com status `pendente` para o trabalhador "Carlos Silva"
- **Quando** o usuário seleciona as diárias, define o responsável e clica em "Emitir Recibo" com a opção "Marcar como pagas" ativa
- **Então** um novo registro de `ReciboPagamento` é persistido com número sequencial, as diárias vinculadas passam para status `pago` e a pré-visualização de 2 vias é exibida.

### Cenário 2: Exclusão com restauração de diárias
- **Dado** um recibo emitido cujas diárias foram marcadas como `pago`
- **Quando** o usuário aciona a exclusão do recibo e marca a opção "Restaurar diárias vinculadas para pendente"
- **Então** o recibo é removido da lista e todas as diárias originalmente associadas voltam ao status `pendente`.

### Cenário 3: Validação de emissão sem seleção
- **Dado** que nenhuma diária foi selecionada na interface
- **Quando** o usuário clica em "Emitir Recibo"
- **Então** o sistema bloqueia a emissão e exibe mensagem de alerta notificando que ao menos um dia trabalhado deve ser selecionado.

