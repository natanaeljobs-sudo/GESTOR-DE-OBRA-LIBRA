---
schemaVersion: 1
generatedAt: 2026-11-13T17:20:15-03:00
reversa:
  version: "1.3.6"
kind: discard_log
producedBy: curator
hash: "sha256:discard-log-libra-obras"
---

# Discard Log — SISTEMA LIBRA - OBRAS

> Registro de regras, mecanismos e artefatos descartados na migração.

---

## 1. Descartes Vinculados à Mudança de Paradigma

| ID | Item Descartado | Origem Legado | Justificativa / Absorção pelo Novo Paradigma |
|---|---|---|---|
| **BR-DESCARTAR-001** | Estado global monolítico em memória (`AppContext.tsx`) | `AppContext.tsx` | Substituído por tabelas relacionais em banco PostgreSQL com queries/mutações assíncronas tipadas. |
| **BR-DESCARTAR-002** | Login simplificado por matching de string (`LoginModal.tsx`) | `LoginModal.tsx` | Substituído por provedor Supabase Auth com hash criptográfico, tokens JWT de sessão e verificação de expiração. |
| **BR-DESCARTAR-003** | Persistência volátil em mock (`initialData.ts`) | `data/initialData.ts` | Dados de bootstrap e demonstração substituídos por migrations SQL e seeders relacionais. |

---

## 2. Descartes Técnicos e Operacionais

| ID | Item Descartado | Origem Legado | Justificativa |
|---|---|---|---|
| **BR-DESCARTAR-004** | Troca de telas via `currentTab` em state React local | `App.tsx` | Substituído por roteamento de URLs amigáveis com controle de histórico, bookmarking e guardas de rota (React Router). |
| **BR-DESCARTAR-005** | Conversão insegura de tipos com `as any` em alertas | `AlertasView.tsx` | Substituído por tipos TypeScript estritos e rotas tipadas para evitar bugs de navegação em tempo de execução. |

