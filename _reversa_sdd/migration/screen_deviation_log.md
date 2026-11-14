---
schemaVersion: 1
generatedAt: 2026-11-13T19:23:45-03:00
reversa:
  version: "1.3.6"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
hash: "sha256:screen-deviation-log-libra-obras"
---

# Screen Deviation Log

> Registro de divergências intencionais entre o legado e a especificação gerada em `target_screens.md`.

## Resumo
- **Total**: 2
- **Pendentes**: 0
- **Aprovadas**: 2
- **Rejeitadas**: 0

## Entradas

### DEV-001
| Campo | Valor |
|---|---|
| Tela afetada | Todas as telas de formulário e listagem |
| Tipo | `modernizacao` |
| Descrição | Adição de estados explícitos de carregamento (Skeleton / Spinners) e tratamento de erros de mutação assíncrona. |
| Motivo | O sistema legado operava exclusivamente com estado local síncrono em memória (Context API). A migração introduz persistência assíncrona (REST/Supabase). |
| Origem no legado | `src/context/AppContext.tsx` |
| Implicação para parity tests | Testes de paridade devem considerar a transição assíncrona de estados. |
| Aprovação | `aprovado` |
| Aprovado por | Usuário (Aprovação Modo 2 Modernizado) |
| Aprovado em | 2026-11-13T19:22:37-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-002
| Campo | Valor |
|---|---|
| Tela afetada | `recibos` e `relatorios` |
| Tipo | `tecnica` |
| Descrição | Preservação do layout estrito para impressão em folha A4 via media query `@media print`. |
| Motivo | Garantir validade jurídica e formatação física precisa para comprovantes de pagamento e relatórios gerenciais da obra. |
| Origem no legado | `src/utils/reciboPrintService.ts`, `src/utils/relatorioPrintService.ts` |
| Implicação para parity tests | Paridade visual estrita exigida apenas na visualização/impressão A4. |
| Aprovação | `aprovado` |
| Aprovado por | Usuário (Aprovação Modo 2 Modernizado) |
| Aprovado em | 2026-11-13T19:22:37-03:00 |
| Propaga para `parity_specs.md § Exceções` | sim |

