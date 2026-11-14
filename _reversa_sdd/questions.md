# Perguntas para Validação Humana — SISTEMA LIBRA - OBRAS

> Gerado pelo Reversa Reviewer em 2026-11-13.
> Preencha a resposta no campo indicado para cada pergunta.

---

### Pergunta 1: Mecanismo de Autenticação na Migração
- **Módulo / Contexto:** `auth` (`_reversa_sdd/auth/`)
- **Classificação:** 🔴 Lacuna de Negócio / Arquitetura
- **Situação Legada:** O sistema legado realiza login via simples seleção de usuário em lista / matching de ID (`LoginModal.tsx`), sem verificação criptográfica de senha nem token JWT/sessão persistida no backend.
- **Pergunta:** Para o novo sistema migrado, qual será a estratégia de autenticação desejada?
  1. Autenticação completa em banco com e-mail/senha criptografados (ex: Supabase Auth / Argon2 / Bcrypt)
  2. Autenticação simplificada (apenas senha/PIN por operador)
  3. Provedor externo / OAuth (Google / corporativo)
- **Resposta:** 1 (Autenticação completa com e-mail/senha criptografados e sessões seguras)
- **Status:** ✅ Respondido

---

### Pergunta 2: Persistência de Dados e Concorrência Multi-usuário
- **Módulo / Contexto:** Global (`architecture.md` / `state-machines.md`)
- **Classificação:** 🟡 Decisão de Migração
- **Situação Legada:** Todo o estado reside em memória RAM (`AppContext.tsx`) com dados simulados em mock (`initialData.ts`). Não há banco de dados SQL conectado.
- **Pergunta:** O sistema operará com múltiplos usuários simultâneos concorrentes na mesma obra/base, necessitando de controle transacional e isolamento por empresa/obra (multi-tenant)?
- **Resposta:** Sim! Multi-usuário com persistência em banco relacional e controle transacional.
- **Status:** ✅ Respondido

