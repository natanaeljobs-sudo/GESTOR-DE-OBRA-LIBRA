---
schemaVersion: 1
generatedAt: 2026-11-13T17:27:10-03:00
reversa:
  version: "1.3.6"
kind: target_architecture
producedBy: designer
hash: "sha256:target-architecture-libra-obras"
---

# Target Architecture — SISTEMA LIBRA - OBRAS

> Especificação de arquitetura do sistema modernizado em produção.

---

## 1. Visão Geral da Arquitetura
O sistema é estruturado como uma Single Page Application (SPA) reativa construída com React 19, TypeScript e Vite, servida globalmente via CDN (Vercel ou Cloudflare Pages). Toda a persistência, integridade referencial ACID, autenticação segura e autorização baseada em Row-Level Security (RLS) são delegadas ao Supabase (PostgreSQL 16 Gerenciado).

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Vercel / Cloudflare)"]
        UI["React 19 + Tailwind CSS"]
        Router["React Router v6 (Rotas Protegidas)"]
        StateHooks["Hooks Reativos de Dados (useDespesas, useDiarias, etc.)"]
        PrintEngine["CSS Print Engine A4 (Recibos)"]
    end

    subgraph SupabasePlatform["Supabase Cloud Platform (Free Tier)"]
        AuthService["Supabase Auth (JWT / Sessões Criptografadas)"]
        PostgresDB[("PostgreSQL 16 Relacional")]
        RLSPolicies["Políticas de Segurança RLS (Tenant / Obra / Perfil)"]
    end

    UI --> Router
    Router --> StateHooks
    UI --> PrintEngine
    StateHooks -->|Queries e Mutações HTTPS / REST| PostgresDB
    StateHooks -->|Token Bearer JWT| AuthService
    RLSPolicies -.->|Filtra Acesso a Nível de Linha| PostgresDB
```

---

## 2. Bounded Contexts e Estrutura de Pastas (Honra à Topologia)

Materializando a topologia **Feature-Sliced Modular**:

```text
src/
├── core/
│   ├── api/supabaseClient.ts       # Inicialização do Supabase JS Client
│   ├── auth/AuthContext.tsx        # Contexto de autenticação e sessão JWT
│   ├── components/                 # Componentes de UI genéricos (Button, Modal, Toast)
│   └── layout/AppLayout.tsx        # Shell de navegação lateral e cabeçalho
├── features/
│   ├── auth/                       # Login, Perfil e Logout
│   ├── obras/                      # Cadastro de Obras e ObraContext (Obra Ativa)
│   ├── financeiro/                 # Despesas, Cartões de Crédito, Rateio
│   ├── maodeobra/                  # Trabalhadores, Diárias e Impressão A4 de Recibos
│   ├── suprimentos/                # Materiais, Controle de Estoque e Orçamentos
│   ├── engenharia/                 # Produção de Obra, Apontamentos Diários e Metas
│   └── relatorios/                 # Dashboards, KPIs consolidados e Alertas
└── types/                          # Interfaces TypeScript tipadas do Supabase
```

---

## 3. Honra ao Paradigma Escolhido (Transformacional)
- **Assincronicidade e Mutabilidade Segura**: Eliminação total do `AppContext` síncrono. As mutações utilizam chamadas assíncronas com feedback imediato via componentes de Toast/Notificação.
- **Autenticação Real**: Login via `supabase.auth.signInWithPassword()` com tokens JWT persistidos em LocalStorage seguro.
- **Segurança Declarativa (RLS)**: Os dados financeiros de uma obra só são visíveis e alteráveis por usuários com permissão explícita vinculada àquela obra.

