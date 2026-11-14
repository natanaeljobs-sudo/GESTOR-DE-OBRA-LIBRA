# ADR-003: Impressão Dedicada em Formato A4 via Templates HTML e Serviços

- **Status:** Aceito (Retroativo) 🟢 CONFIRMADO
- **Data:** 2026-11-13 (evidenciado pelos commits `7cadf8f`, `95d8e3d`, `f12bef6`)

## Contexto
Recibos de pagamento de diárias e relatórios consolidados de obra exigem formatação A4 fiel para impressão ou salvamento em PDF, sem interferência do layout responsivo da interface.

## Decisão
Implementar serviços dedicados (`reciboPrintService.ts` e `relatorioPrintService.ts`) e templates em `public/print-recibo.html` e `public/print-relatorio.html`, além de modal de pré-visualização A4 (`ReciboPreviewModal.tsx`).

