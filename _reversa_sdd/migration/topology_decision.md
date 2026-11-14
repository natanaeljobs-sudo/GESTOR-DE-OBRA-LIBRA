---
schemaVersion: 1
generatedAt: 2026-11-13T17:21:10-03:00
reversa:
  version: "1.3.6"
kind: topology_decision
producedBy: designer
hash: "sha256:topology-decision-libra-obras"
---

# Topology Decision — SISTEMA LIBRA - OBRAS

> Decisão de topologia estrutural do sistema alvo. Fase 1 do Designer.

---

## 1. Topologia Legada Detectada
- **Padrão**: Monolito Frontend em Pasta Única de Componentes Flat (🟢 CONFIRMADO em `inventory.md` e `architecture.md`).
- **Estrutura Observada**: Quase todos os arquivos (`AlertasView.tsx`, `CartoesView.tsx`, `DespesasView.tsx`, etc.) residem diretamente na raiz ou em pasta única plana com acoplamento bidirecional ao `AppContext.tsx`.

## 2. Diagnóstico Estrutural
- **Avaliação**: **Problemática**.
- **Causa Principal**: Ausência de separação entre regras de negócio, chamadas de dados e apresentação visual. Mistura de lógica de impressão CSS, manipulação de estado e tabelas de exibição no mesmo componente.

## 3. Topologia Moderna Proposta
- **Padrão Proposto**: **Feature-Sliced Modular (Vertical Slices por Domínio de Obra)**.
- **Estrutura Proposta**:
  ```text
  src/
  ├── core/            # Supabase client, auth context, layout base, ui components
  ├── features/
  │   ├── auth/        # Login, recuperação, perfil
  │   ├── obras/       # Cadastro de obras, seleção ativa e tenant context
  │   ├── financeiro/  # Despesas, Cartões, Rateio (queries, mutations, componentes)
  │   ├── maodeobra/   # Trabalhadores, Diárias e Emissão A4 de Recibos
  │   ├── suprimentos/ # Materiais, Estoque e Cotações/Orçamentos
  │   ├── engenharia/  # Produção diária, Metas e Alertas
  │   └── relatorios/  # Dashboards executivos e exportações
  └── types/           # Interfaces e schemas tipados gerados do Postgres
  ```
- **Justificativa**: Organização altamente coesa, facilitando manutenção, testes unitários, carregamento dinâmico de abas e isolamento de regras financeiras.

## 4. Opções Apresentadas
1. **Preservar Topologia Legada (Conservadora)**: Manter pastas planas `components/` com tudo junto.
2. **Adotar Topologia Moderna Proposta (Feature-Sliced Modular - Recomendada)**: Isolamento por áreas de negócio da obra.
3. **Híbrida**: Agrupar apenas a camada de dados em serviços e manter componentes de tela planos.

## 5. Recomendação do Designer
- **Opção 2 (Topologia Moderna Feature-Sliced Modular)**: É o padrão ideal para projetos React + Vite que escalam com segurança.

