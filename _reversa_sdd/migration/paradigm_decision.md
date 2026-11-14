---
schemaVersion: 1
generatedAt: 2026-11-13T17:19:45-03:00
reversa:
  version: "1.3.6"
kind: paradigm_decision
producedBy: paradigm_advisor
hash: "sha256:paradigm-decision-libra-obras"
---

# Paradigm Decision — SISTEMA LIBRA - OBRAS

> Decisão de paradigma e gap arquitetural. Leitura mandatória para Curator, Strategist, Designer, Screen Translator e Inspector.

## 1. Classificação do Legado
- **Paradigma Detectado**: Funcional / Reativo de Frontend com Estado Monolítico em Memória (🟢 CONFIRMADO em `architecture.md`, `domain.md` e ADR-001).
- **Evidências**:
  - `AppContext.tsx` concentra todos os arrays de dados (despesas, diárias, materiais, etc.) em memória RAM.
  - CRUD síncrono inline sem chamadas de rede ou persistência em banco.
  - Login mockado por seleção de usuário sem credenciais ou token de sessão.

## 2. Paradigma Natural da Stack Alvo
- **Stack**: React (TypeScript) + Vite + Tailwind CSS + Supabase (PostgreSQL + RLS + Auth).
- **Paradigma Alvo**: BaaS Relacional Declarativo com Segurança Row-Level (RLS) + Frontend Reativo Assíncrono com queries tipadas.
- **Justificativa**: O PostgreSQL garante consistência ACID e multi-usuário simultâneo com concorrência segura, enquanto o Supabase Auth e RLS aplicam regras de segurança diretamente na camada de banco de dados.

## 3. Análise do Gap
- **Severidade**: Alta (Mudança de Modelo Mental: Síncrono/Memória → Assíncrono/ACID Relacional).
- **Implicações Concretas**:
  1. *Assincronicidade e Feedback de UI*: Mutações de dados agora exigem estados de loading, tratamento de falhas de rede e feedback visual ao usuário (Toasts / Spinners).
  2. *Autenticação Real*: Sessões gerenciadas via JWT seguro pelo Supabase Auth.
  3. *Integridade Referencial*: Exclusões e atualizações respeitam constraints de chaves estrangeiras (`CASCADE` / `RESTRICT`).
  4. *Multi-obra e Concorrência*: Isolamento por `obra_id` / `tenant_id` nas queries com políticas RLS.

## 4. Decisão do Usuário
- **Opção Escolhida**: **1. Transformacional** (Adotar o paradigma natural da stack alvo).
- **Justificativa do Usuário**: Colocar o sistema em produção real para gerenciar obras físicas cotidianas com confiabilidade e sem custos de infraestrutura.
- **Apetite Derivado**: `transformational`

## 5. Diretrizes para os Próximos Agentes
- **Curator**: Eliminar débitos técnicos de estado em memória e manter intactas todas as regras de cálculo e validação das obras.
- **Strategist**: Priorizar estratégia orientada a dados (Database First) com Supabase e paridade funcional completa dos 12 módulos.
- **Designer**: Modelar arquitetura limpa com camada de serviços/hooks de dados (`useDespesas`, `useDiarias`, etc.) e esquema SQL com RLS.
- **Screen Translator**: Manter layout Tailwind e componentes, adaptando para estados assíncronos e impressão A4 perfeita em `recibos`.
- **Inspector**: Garantir validação de paridade de regras de negócio financeiras e cálculos de diárias.

