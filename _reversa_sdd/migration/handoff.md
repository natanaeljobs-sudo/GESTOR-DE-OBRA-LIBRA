---
schemaVersion: 1
generatedAt: 2026-11-13T19:25:00-03:00
reversa:
  version: "1.3.6"
kind: migration_handoff
producedBy: reversa-migrate
---

# Handoff de Migração — SISTEMA LIBRA - OBRAS

> Documento final consolidado gerado pelo orquestrador `/reversa-migrate`.
> Este é o guia de entrada obrigatório para o Agente de Codificação (ou equipe de desenvolvimento) que construirá o sistema novo.

---

## 1. Leitura Obrigatória Inicial
Antes de escrever qualquer linha de código, leia atentamente:
1. [paradigm_decision.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/paradigm_decision.md): Define como pensar a nova arquitetura (transformação para web moderna com persistência assíncrona).
2. [topology_decision.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/topology_decision.md): Define como estruturar os diretórios e módulos do projeto novo.
3. [target_architecture.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_architecture.md): Visão completa da stack (React 19 + Tailwind CSS + Lucide Icons + Supabase/PostgreSQL).

---

## 2. Mapa dos Artefatos de Migração Gerados

| Artefato | Finalidade |
|---|---|
| [migration_brief.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/migration_brief.md) | Briefing de requisitos, metas e restrições da migração |
| [paradigm_decision.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/paradigm_decision.md) | Decisão de mudança de paradigma e apetite de migração |
| [target_business_rules.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_business_rules.md) | Regras de negócio essenciais preservadas do legado |
| [discard_log.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/discard_log.md) | Código e comportamentos obsoletos descartados |
| [migration_strategy.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/migration_strategy.md) | Estratégia de cutover e execução |
| [risk_register.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/risk_register.md) | Matriz de riscos e mitigações |
| [cutover_plan.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/cutover_plan.md) | Roteiro de transição e plano de rollback |
| [topology_decision.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/topology_decision.md) | Organização das pastas e arquitetura de componentes |
| [target_architecture.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_architecture.md) | C4 Container e arquitetura técnica alvo |
| [target_domain_model.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_domain_model.md) | Entidades e agregados do domínio |
| [target_data_model.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_data_model.md) | Modelo relacional e DDL para PostgreSQL |
| [data_migration_plan.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/data_migration_plan.md) | Scripts de carga de dados e validação de paridade |
| [screen_modernization_decision.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/screen_modernization_decision.md) | Aprovação do modo de telas modernizado |
| [target_screens.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_screens.md) | Especificação das 12 telas com 4 estados |
| [screen_deviation_log.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/screen_deviation_log.md) | Deviations registradas e aprovadas |
| [parity_specs.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/parity_specs.md) | Critérios de homologação e paridade funcional |
| [parity_tests/](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/parity_tests/) | Casos de teste em Gherkin para validação de fluxos |
| [ambiguity_log.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/ambiguity_log.md) | Log de resolução de ambiguidades |

---

## 3. Itens Referidos à Codificação
O agente de codificação deve prestar atenção especial a:
1. **Fidelidade de Impressão A4 de Recibos**: Em [recibos](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/recibos/requirements.md), garantir que o CSS de impressão respeite milimetricamente o layout A4 com campos para assinatura.
2. **Segurança por Obra (RLS)**: No PostgreSQL/Supabase, garantir que as tabelas de `obras`, `despesas` e `cartoes` tenham Row-Level Security habilitado por inquilino/obra.
3. **Ergonomia e Feedback Assíncrono**: Implementar os estados `Loading` e `Error` nas telas descritas em [target_screens.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_screens.md).

---

## 4. Próximos Passos Recomendados para Codificação
1. **Configurar Repositório Alvo**: Inicializar projeto com React 19, Tailwind CSS e cliente Supabase.
2. **Aplicar Migrations de Banco**: Executar o DDL definido em [target_data_model.md](file:///c:/Users/Natanael/Desktop/SISTEMA%20LIBRA%20-%20OBRAS/_reversa_sdd/migration/target_data_model.md).
3. **Construir de Baixo para Cima (Bottom-Up)**:
   - Configurar Auth e Contextos de Estado.
   - Criar formulários e tabelas por feature seguindo `target_screens.md`.
4. **Validar Paridade**: Rodar a homologação contra os cenários em `parity_tests/`.

