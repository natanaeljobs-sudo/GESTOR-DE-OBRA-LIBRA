---
schemaVersion: 1
generatedAt: 2026-11-13T17:17:30-03:00
reversa:
  version: "1.3.6"
kind: migration_brief
producedBy: orchestrator
hash: "sha256:migration-brief-libra-obras"
---

# Migration Brief — SISTEMA LIBRA - OBRAS

> Documento de critério de migração coletado em entrevista no início do `/reversa-migrate`.
> Consumido pelos seis agentes do Time de Migração.

## Objetivo da migração
- Colocar o sistema em produção real para gerenciar obras físicas cotidianas.
- Habilitar operação multi-usuário com persistência em nuvem segura, transacional e escalável, superando o estado em memória simulado do legado.

## Métricas de sucesso
- Sistema operando em produção com zero perda de dados financeiros ou de produção de obras.
- Autenticação e controle de acesso estrito por perfil (Administrador, Engenheiro, Mestre de Obras, etc.).
- Preservação da fidelidade visual e funcional dos recibos de pagamento em formato A4 para impressão/assinatura física.
- Hospedagem e backend operando dentro das camadas gratuitas (Zero Cost Tier) de plataformas como Vercel/Cloudflare Pages e Supabase (PostgreSQL + Auth).

## Restrições
- **Orçamento / Infra**: Custo zero de infraestrutura inicial (Vercel ou Cloudflare para Frontend; Supabase Free Tier para Postgres e Auth).
- **Técnicas**:
  - Manter e evoluir a stack base: React (TypeScript) + Tailwind CSS + Lucide Icons.
  - Persistência estruturada em PostgreSQL (tabelas normalizadas mapeadas no ERD).
  - Fidelidade estrita na impressão A4 de recibos de pagamento (`recibos`).
  - Controle de permissões baseado em papéis (RBAC estrito) em nível de interface e banco (RLS).
- **Operacionais**: Interface responsiva e acessível para uso em campo (obras) e escritório.

## Fatores de risco conhecidos
- **Formatação de Impressão A4**: Regras de CSS Print para garantir que recibos quebrem ou caibam perfeitamente na folha sem distorção.
- **Concorrência e Locks**: Múltiplos lançamentos simultâneos de despesas e apontamentos de diárias na mesma obra.
- **Transição de Estado Global para API/DB**: Desacoplar os componentes do antigo `AppContext` síncrono para mutações e consultas assíncronas reativas.

## Stakeholders
| Nome / papel | Responsabilidade na migração |
|---|---|
| Ives (Usuário / Product Owner) | Aprovação de regras de negócio, topologia e validação de telas |
| Reversa Migration Team | Modelagem de arquitetura alvo, estratégia e especificações de paridade |

## Stack alvo
- **Linguagem**: TypeScript
- **Framework Frontend**: React + Vite (ou Next.js) com Tailwind CSS e Lucide Icons
- **Banco de Dados & Auth**: Supabase (PostgreSQL com RLS habilitado + Supabase Auth)
- **Hospedagem / Infra**: Vercel ou Cloudflare Pages (Deploy estático/SPA otimizado com CDN global)
- **Mensageria / Realtime**: Supabase Realtime (se necessário para sincronização de alertas e dashboard)

## Escopo declarado
- **Incluído**: Todos os 12 módulos canônicos do sistema:
  1. `auth` (Autenticação real com e-mail/senha)
  2. `dashboard` (KPIs em tempo real)
  3. `alertas` (Monitoramento de estouro de orçamento e prazos)
  4. `cartoes` (Controle de faturas e limites)
  5. `despesas` (Lançamento e rateio)
  6. `maodeobra` (Equipes e diárias)
  7. `materiais` (Catálogo e estoque)
  8. `orcamentos` (Cotações e conversão)
  9. `producao` (Apontamentos e metas de obra)
  10. `recibos` (Emissão e impressão A4 idêntica)
  11. `relatorios` (Consolidação financeira)
  12. `usuarios` (RBAC e gestão de usuários)
- **Excluído**: Nenhum módulo foi excluído.

## Notas livres
- O sistema precisa manter a simplicidade e rapidez de uso que a interface legada já oferecia, porém com persistência real em nuvem e permissões seguras.

