---
schemaVersion: 1
generatedAt: 2026-11-13T17:20:50-03:00
reversa:
  version: "1.3.6"
kind: risk_register
producedBy: strategist
hash: "sha256:risk-register-libra-obras"
---

# Risk Register — SISTEMA LIBRA - OBRAS

> Registro de riscos de migração e mitigações.

| ID | Risco | Probabilidade | Impacto | Mitigação | Owner |
|---|---|:---:|:---:|---|---|
| **RSK-001** | Quebra de formatação ou paginação na impressão A4 de Recibos | Média | Alto | Criação de suíte de testes de CSS `@media print` com margens em milímetros e componentes estritamente controlados. | Frontend Dev |
| **RSK-002** | Concorrência de múltiplos lançamentos simultâneos na mesma obra | Baixa | Médio | Transações ACID nativas do PostgreSQL com constraints de chave e triggers de integridade. | Database / Supabase |
| **RSK-003** | Vazamento de dados entre obras/empresas distintas | Baixa | Crítico | Aplicação mandatória de Row-Level Security (RLS) em todas as tabelas vinculando `obra_id` e usuário autenticado. | Security / Backend |
| **RSK-004** | Exceder o plano gratuito do Supabase ou Vercel | Muito Baixa | Baixo | Uso eficiente de índices Postgres, sem polling excessivo (usar subscrições Realtime criteriosas) e assets estáticos via CDN. | DevOps / Arquiteto |

