# Visão Geral da Arquitetura — SISTEMA LIBRA - OBRAS

> Gerado pelo **Architect** em 2026-11-13

---

## 1. Visão Geral

O **SISTEMA LIBRA - OBRAS** é uma Single Page Application (SPA) construída com **React 19**, **TypeScript**, **Vite** e **Tailwind CSS**, preparada para funcionar como Progressive Web App (PWA). O sistema centraliza o gerenciamento operacional, financeiro e gerencial de obras de construção civil. 🟢 CONFIRMADO

---

## 2. Padrão Arquitetural Atual

- **Frontend Monolítico em Camada Única:** Aplicação focada no cliente, estruturada por módulos visuais (`src/components/*`).
- **Gerenciamento de Estado:** Centralizado em `AppContext` (`src/context/AppContext.tsx`), provendo leitura e mutação das entidades em memória. 🟢 CONFIRMADO
- **Navegação:** Seleção de tela por aba ativa (`activeTab`) em `App.tsx` sem roteador de URLs (`react-router`). 🟢 CONFIRMADO
- **Serviços Utilitários:** Emissão de impressão A4 dedicada via `reciboPrintService.ts`, `relatorioPrintService.ts` e páginas HTML estáticas em `public/`. 🟢 CONFIRMADO
- **Persistência Externa:** Ausente na versão analisada; utiliza `src/data/initialData.ts` em memória como mock operacional. 🟢 CONFIRMADO

---

## 3. Dívidas Técnicas Identificadas

1. **Estado Monolítico (`AppContext.tsx` com ~1.200 linhas):** Todas as entidades (Obras, Despesas, Diárias, Orçamentos, Usuários) compartilham o mesmo contexto, aumentando acoplamento e re-renderizações desnecessárias. 🟡 INFERIDO
2. **Ausência de Backend / Persistência Real:** Dados são voláteis em memória, sem banco relacional ativo (preparação necessária para migração Supabase/Postgres). 🟢 CONFIRMADO
3. **Autenticação Insegura:** Busca simples de usuário por nome/e-mail, sem validação de credenciais, hash de senha ou tokens de sessão. 🟢 CONFIRMADO
4. **Acoplamento de Regras de Negócio na UI:** Cálculos de rateio, diárias e saldo estão distribuídos diretamente entre os componentes e o contexto React. 🟡 INFERIDO
5. **Ausência de Testes Automatizados:** Não foram identificados arquivos de testes unitários ou de integração (`.test.tsx` / `.spec.ts`). 🟢 CONFIRMADO

