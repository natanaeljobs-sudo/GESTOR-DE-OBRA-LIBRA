---
schemaVersion: 1
generatedAt: 2026-11-13T17:20:45-03:00
reversa:
  version: "1.3.6"
kind: migration_strategy
producedBy: strategist
hash: "sha256:migration-strategy-libra-obras"
---

# Migration Strategy — SISTEMA LIBRA - OBRAS

> Estratégia de migração proposta pelo Strategist.

---

## 1. Avaliação de Estratégias

### Estratégia 1: Greenfield Clean Slate (Recomendada) 🌟
- **Conceito**: Criação de um projeto moderno limpo (Vite + React + Tailwind + Supabase) reconstruindo os componentes com base nas especificações canônicas (`_reversa_sdd/`), importando a lógica e contratos já validados.
- **Adequação ao Projeto**: Altíssima. Como o legado reside 100% em memória RAM e não há banco de produção antigo com migração de terabytes de dados históricos, reconstruir diretamente sobre um schema PostgreSQL limpo e tipado é muito mais rápido e livre de débitos técnicos.
- **Custo e Tempo**: Menor tempo de desenvolvimento e custo zero de infraestrutura.
- **Risco**: Baixo a Médio (validar paridade dos cálculos e regras de diárias).

### Estratégia 2: Strangler Fig Adaptativo (Abordagem Modular Progressiva)
- **Conceito**: Migrar módulo a módulo conectando gradualmente as chamadas ao Supabase.
- **Trade-off**: Incorre em sobrecarga desnecessária de manter código legado convivendo com o novo em um sistema que era uma SPA estática única sem backend.

---

## 2. Recomendação Oficial
- **Estratégia Escolhida**: **Greenfield Clean Slate** orientado a Especificações (Specs-Driven Development).
- **Sequência de Construção Recomendada**:
  1. *Fase Fundação*: Supabase Schema (Tabelas, RLS e Auth).
  2. *Fase Núcleo*: Autenticação real, Usuários e Obras.
  3. *Fase Mão de Obra e Recibos*: Trabalhadores, Diárias e Emissão A4.
  4. *Fase Financeiro & Cartões*: Despesas, Faturas e Rateios.
  5. *Fase Engenharia & Estoque*: Materiais, Orçamentos e Produção.
  6. *Fase Executiva*: Alertas, Dashboard e Relatórios.

