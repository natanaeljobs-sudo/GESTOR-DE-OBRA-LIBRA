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

## Fase 6: Migração & Reconstrução Moderna (Supabase + React 19) 🚀

- [x] ✅ **Orquestrador `/reversa-migrate`** — Coleta de brief e execução dos 6 agentes de migração
- [x] ✅ **Paradigm Advisor** — Mudança para SPA Web com persistência assíncrona desacoplada
- [x] ✅ **Curator & Strategist** — Inventário de regras, matriz de riscos e cutover plan
- [x] ✅ **Designer & Data Model** — DDL PostgreSQL com 9 tabelas, Storage para comprovantes e políticas RLS
- [x] ✅ **Screen Translator** — Especificação modernizada de 12 telas com 4 estados (Idle, Loading, Error, Success)
- [x] ✅ **Inspector** — Especificações de paridade (`parity_specs.md`) e testes BDD Gherkin

## Fase 7: Implementação dos Módulos no Sistema Alvo 💻

- [x] ✅ **Autenticação** — Sessão e login real Supabase Auth
- [x] ✅ **Obras** — CRUD com seleção de obra ativa
- [x] ✅ **Despesas** — Discriminador de itens, cálculo de rateio e upload no Supabase Storage
- [x] ✅ **Mão de Obra e Recibos** — Diárias fracionadas, rastreabilidade e impressão em folha A4
- [x] ✅ **Materiais & Estoque** — Sincronização em tempo real com `public.materiais`
- [x] ✅ **Produção de Trilhos/Placas** — Apontamento de lotes conectado a `public.producao_apontamentos`
- [x] ✅ **Cartões & Contas** — Gestão de cartões corporativos sincronizada com `public.cartoes`
- [x] ✅ **Orçamentos & Cotações** — Comparador de fornecedores e conversão automática em despesas
- [x] ✅ **Relatórios Gerenciais** — Centros de custo e fechamentos dinâmicos
- [x] ✅ **Usuários & Perfis** — Gestão granular de perfis (Master, Admin, Operador) em `public.usuarios_perfis`
- [x] ✅ **Homologação de Paridade** — Validação formal dos cenários PAR-01, PAR-02 e PAR-03 com 100% de aprovação

---

## Próximo passo

- **Atualização de Telas & Design**: Integração visual com Google Stitch (via Stitch MCP ou componentes).
- **Ativação em Produção**: Go-Live / Cutover final com deploy em nuvem (Vercel / Cloudflare Pages / Netlify).
