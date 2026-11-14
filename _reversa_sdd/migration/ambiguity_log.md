# Ambiguity Log — SISTEMA LIBRA - OBRAS

> Registro consolidado de ambiguidades, pendências e decisões humanas do Time de Migração.

---

## 1. Pendentes
*(Nenhum item pendente. Todos os itens foram resolvidos).*

---

## 2. Resolvidos com Decisão Humana

| Item | Origem | Decisão Adotada | Aprovado Por |
|---|---|---|---|
| **Estratégia de Autenticação** | `questions.md` / `auth` | Opção 1: Supabase Auth (E-mail/senha com tokens seguros e RLS) | PO / Usuário |
| **Persistência e Concorrência** | `questions.md` / Global | Suporte a multi-usuário e multi-obra com banco relacional PostgreSQL | PO / Usuário |
| **Apetite de Migração** | `paradigm_decision.md` | Opção 1: Transformacional (adoção do paradigma natural da stack alvo) | PO / Usuário |
| **Topologia Arquitetural** | `topology_decision.md` | Modular por feature (desacoplada da estrutura em monólito do legado) | PO / Usuário |
| **Modo de Telas** | `screen_modernization_decision.md` | Modo 2: Modernizado (com precisão estrita em impressão A4 de recibos) | PO / Usuário |

---

## 3. Referidos à Codificação

| Item | Contexto | Ação para o Agente de Codificação |
|---|---|---|
| **Fidelidade CSS Print A4** | `recibos` e `relatorios` | Configurar `@media print` para folha A4 com margens milimétricas e quebra controlada |
| **Políticas RLS por Obra** | PostgreSQL | Criar políticas de Row-Level Security filtrando por `obra_id` vinculado ao usuário |
| **Gestão Assíncrona de Estados** | Frontend | Implementar tratamento de `Loading` (Skeleton/Spinner) e `Error` nas mutações de formulários |
