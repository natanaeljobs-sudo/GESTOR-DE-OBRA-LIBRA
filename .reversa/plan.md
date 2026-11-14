# Plano de Exploração — SISTEMA LIBRA - OBRAS

> Criado pelo Reversa em 2026-11-13
> Marque cada tarefa com ✅ quando concluída.
> Você pode editar este plano antes de iniciar: adicione, remova ou reordene tarefas conforme necessário.

---

## Fase 1: Reconhecimento 🔍

- [x] ✅ **Scout** — Mapeamento de estrutura de pastas e tecnologias
- [x] ✅ **Scout** — Análise de dependências e gerenciadores de pacotes
- [x] ✅ **Scout** — Identificação de entry points, CI/CD e configurações

## Decisão de organização das specs 🗂️

> Entre o Scout e o Arqueólogo, o Reversa pergunta como você quer organizar as specs (por módulo, caso de uso, endpoint, híbrida, por features ou customizada). A escolha fica persistida em `.reversa/config.toml` na seção `[specs]` e não será reperguntada em execuções futuras. Para reapresentar o menu, remova manualmente a seção.

## Fase 2: Escavação 🏗️

> O Reversa preenche esta seção com os módulos reais após o Scout concluir o reconhecimento.

- [x] ✅ **Archaeologist** — Análise do módulo `auth`
- [x] ✅ **Archaeologist** — Análise do módulo `dashboard`
- [x] ✅ **Archaeologist** — Análise do módulo `alertas`
- [x] ✅ **Archaeologist** — Análise do módulo `cartoes`
- [x] ✅ **Archaeologist** — Análise do módulo `despesas`
- [x] ✅ **Archaeologist** — Análise do módulo `maodeobra`
- [x] ✅ **Archaeologist** — Análise do módulo `materiais`
- [x] ✅ **Archaeologist** — Análise do módulo `orcamentos`
- [x] ✅ **Archaeologist** — Análise do módulo `producao`
- [x] ✅ **Archaeologist** — Análise do módulo `recibos`
- [x] ✅ **Archaeologist** — Análise do módulo `relatorios`
- [x] ✅ **Archaeologist** — Análise do módulo `usuarios`

## Fase 3: Interpretação 🧠

- [x] ✅ **Detetive** — Arqueologia Git e ADRs retroativos
- [x] ✅ **Detetive** — Regras de negócio implícitas e máquinas de estado
- [x] ✅ **Detetive** — Matriz de permissões (RBAC/ACL)
- [x] ✅ **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes)
- [x] ✅ **Arquiteto** — ERD completo e integrações externas
- [x] ✅ **Arquiteto** — Spec Impact Matrix

## Fase 4: Geração 📝

- [x] ✅ **Redator** — Specs SDD por componente (12 módulos canônicos)
- [x] ✅ **Redator** — Code/Spec Matrix (`_reversa_sdd/traceability/code-spec-matrix.md`)
- [ ] **Redator** — OpenAPI (se aplicável - sistema em memória/SPA, não expõe API externa)
- [ ] **Redator** — User Stories (se aplicável)

## Fase 5: Revisão ✅

- [x] ✅ **Revisor** — Revisão cruzada de specs
- [x] ✅ **Revisor** — Resolução de lacunas com o usuário (`_reversa_sdd/questions.md`)
- [x] ✅ **Revisor** — Relatório de confiança final (`_reversa_sdd/confidence-report.md`)

---

## Agentes Independentes

> Execute estes agentes quando os recursos estiverem disponíveis — podem rodar em qualquer fase.

- [ ] **Visor** — Análise de interface via screenshots
- [ ] **Data Master** — Análise completa do banco de dados
- [ ] **Design System** — Extração de tokens de design
- [ ] **Tracer** — Análise dinâmica (requer sistema acessível)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar um dos fluxos seguintes:

- `/reversa-migrate`: orquestrador do **Time de Migração** (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector). Gera as specs do sistema novo. Saída em `_reversa_sdd/migration/` e `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
