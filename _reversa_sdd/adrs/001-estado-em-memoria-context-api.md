# ADR-001: Gerenciamento de Estado em Memória via React Context API

- **Status:** Aceito (Retroativo) 🟢 CONFIRMADO
- **Data:** 2026-11-13 (inferido do histórico Git inicial `b6154cb`)

## Contexto
O sistema precisava de prototipação rápida e funcional de todos os módulos de gestão de obras (despesas, mão de obra, recibos, orçamentos, usuários) antes da integração com um backend persistente.

## Decisão
Centralizar todo o estado da aplicação e as ações CRUD em `src/context/AppContext.tsx` utilizando React Context API (`useApp()`), populado inicialmente por `src/data/initialData.ts`.

