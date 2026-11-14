---
schemaVersion: 1
generatedAt: 2026-11-13T17:20:10-03:00
reversa:
  version: "1.3.6"
kind: target_business_rules
producedBy: curator
hash: "sha256:target-business-rules-libra-obras"
---

# Target Business Rules — SISTEMA LIBRA - OBRAS

> Curadoria das regras de negócio do legado para o sistema alvo.
> Consome: specs SDD dos 12 módulos, `migration_brief.md` e `paradigm_decision.md`.

---

## 1. Regras Aprovadas para Migração (MIGRAR)

### 1.1 Módulo Financeiro & Cartões (`despesas`, `cartoes`)
- **BR-MIGRAR-001**: O valor total da despesa deve ser positivo e possuir categoria válida (`Alimentação`, `Combustível`, `Equipamentos`, `Materiais`, `Mão de Obra`, `Outros`).
- **BR-MIGRAR-002**: Despesas pagas via `Cartão` devem vincular obrigatoriamente um `cartaoId` válido e recalcular o limite disponível do cartão.
- **BR-MIGRAR-003**: Divisão de pagamentos: uma despesa pode ser quitada com múltiplos métodos/cartões, desde que a soma das parcelas seja rigorosamente igual ao valor total da despesa.
- **BR-MIGRAR-004**: Fechamento de Fatura: compras efetuadas após o dia de fechamento do cartão são lançadas na fatura do mês subsequente.

### 1.2 Módulo de Mão de Obra e Recibos (`maodeobra`, `recibos`)
- **BR-MIGRAR-005**: Diárias registradas vinculam um profissional (`Trabalhador`), data, valor acordado e status (`pendente` ou `pago`).
- **BR-MIGRAR-006**: Ao gerar um recibo de pagamento para um trabalhador, as diárias selecionadas transitam automaticamente de `pendente` para `pago`.
- **BR-MIGRAR-007**: Fidelidade de Impressão A4: O layout do recibo deve gerar cabeçalho da empresa, detalhamento das diárias, retenções/descontos e campo formal de assinatura física em folha A4 padronizada.

### 1.3 Módulo de Materiais e Orçamentos (`materiais`, `orcamentos`)
- **BR-MIGRAR-008**: Controle de Estoque de Obra: movimentações de entrada incrementam saldo de estoque; saídas para frentes de obra decrementam com validação de saldo mínimo.
- **BR-MIGRAR-009**: Conversão de Orçamento: cotação aprovada pode ser convertida diretamente em registro de despesa, herdando fornecedor, valor e itens cotados.

### 1.4 Módulo de Produção e Alertas (`producao`, `alertas`, `dashboard`)
- **BR-MIGRAR-010**: Metas de Produção: apontamentos diários alimentam o percentual de evolução física da obra versus cronograma previsto.
- **BR-MIGRAR-011**: Alertas Inteligentes: gatilhos automáticos disparam alerta visual quando gastos de uma categoria atingem 85% do teto orçado da obra ou quando faturas de cartões estão a 3 dias do vencimento.

---

## 2. Regras Descartadas (DESCARTAR)

- **BR-DESCARTAR-001**: Manipulação de arrays em memória RAM via `setDespesas([...])` no `AppContext` (Vinculada a Paradigma: substituída por `INSERT / UPDATE` no PostgreSQL).
- **BR-DESCARTAR-002**: Login mockado sem validação de credenciais (Vinculada a Paradigma: substituída por Supabase Auth JWT).
- **BR-DESCARTAR-003**: Navegação SPA por troca de aba em string de estado local sem URL ou roteamento formal (Substituída por roteador com rotas protegidas).

---

## 3. Decisões Humanas Consolidadas (DECISÃO HUMANA)

- **BR-HUMANA-001 [RESOLVIDO]**: Mecanismo de autenticação real escolhido pelo usuário: Opção 1 (E-mail/senha com Supabase Auth e RLS).
- **BR-HUMANA-002 [RESOLVIDO]**: Concorrência multi-usuário e multi-obra: Confirmado pelo usuário suporte pleno a múltiplos operadores simultâneos via PostgreSQL ACID.

