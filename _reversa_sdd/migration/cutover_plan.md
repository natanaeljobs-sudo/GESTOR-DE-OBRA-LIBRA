---
schemaVersion: 1
generatedAt: 2026-11-13T17:20:55-03:00
reversa:
  version: "1.3.6"
kind: cutover_plan
producedBy: strategist
hash: "sha256:cutover-plan-libra-obras"
---

# Cutover Plan — SISTEMA LIBRA - OBRAS

> Plano de ativação e entrada em produção (Go-Live).

---

## 1. Pré-requisitos para Go-Live
- Projeto criado no Supabase com tabelas executadas via migrations.
- Políticas de RLS testadas e validadas com diferentes perfis.
- Build de produção gerado no frontend sem erros de TypeScript.
- Homologação visual da impressão do recibo em PDF/impressora física.

## 2. Passos de Lançamento (Duração estimada: 2 horas)
1. **Provisionamento do Banco**: Rodar scripts SQL com schema completo e dados iniciais de parametrização.
2. **Deploy do Frontend**: Conectar repositório GitHub à Vercel ou Cloudflare Pages com variáveis de ambiente configuradas (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
3. **Criação do Usuário Master / Admin**: Cadastrar o primeiro e-mail administrativo via Supabase Auth.
4. **Smoke Test**: Cadastrar uma obra piloto, 1 trabalhador, 1 diária, gerar recibo impresso e validar reflexo no Dashboard.
5. **Abertura para Operação**: Disponibilização do link oficial para os mestres e gestores de obra.

