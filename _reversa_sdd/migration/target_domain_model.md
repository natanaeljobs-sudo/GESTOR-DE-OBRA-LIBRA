---
schemaVersion: 1
generatedAt: 2026-11-13T17:27:20-03:00
reversa:
  version: "1.3.6"
kind: target_domain_model
producedBy: designer
hash: "sha256:target-domain-model-libra-obras"
---

# Target Domain Model — SISTEMA LIBRA - OBRAS

> Modelo de domínio modernizado e mapeamento para o novo sistema.

---

## 1. Principais Aggregates e Entidades de Domínio

### Aggregate 1: Obra (Tenant Root)
- **Root**: `Obra`
- **Atributos**: `id`, `nome`, `endereco`, `data_inicio`, `orcamento_total`, `status` (`ativa`, `concluida`, `pausada`).
- **Invariantes**: Toda despesa, diária, material e apontamento de produção deve pertencer estritamente a uma `Obra`.

### Aggregate 2: Financeiro
- **Root**: `Despesa`
- **Entidades Internas**: `ParcelaDespesa`, `CartaoCredito`, `FaturaCartao`.
- **Invariantes**:
  - `valor_total` = soma das parcelas ou métodos de pagamento rateados.
  - Se método for `Cartão`, o limite disponível do cartão deve ser deduzido.

### Aggregate 3: Mão de Obra & Recibos
- **Root**: `Trabalhador`
- **Entidades Internas**: `Diaria`, `ReciboPagamento`.
- **Invariantes**:
  - Uma `Diaria` não pode ser duplicada para o mesmo trabalhador na mesma data.
  - Ao emitir um `ReciboPagamento`, as diárias vinculadas tornam-se imutáveis e assumem status `pago`.

### Aggregate 4: Suprimentos
- **Root**: `Material`
- **Entidades Internas**: `MovimentacaoEstoque`, `CotacaoOrcamento`.
- **Invariantes**: Saldo em estoque não pode ser negativo; saídas exigem destino de frente de obra.

---

## 2. Rastreabilidade com Regras de Negócio do Legado

| Regra Alvo | Origem SDD | Localização no Domínio Alvo |
|---|---|---|
| **BR-MIGRAR-001** (Validação de Despesas) | `_reversa_sdd/despesas/` | `features/financeiro/types.ts` & DB Check Constraint |
| **BR-MIGRAR-004** (Fechamento de Faturas) | `_reversa_sdd/cartoes/` | `features/financeiro/domain/faturaCalculator.ts` |
| **BR-MIGRAR-006** (Baixa de Diárias via Recibo) | `_reversa_sdd/recibos/` | `features/maodeobra/services/reciboService.ts` |
| **BR-MIGRAR-007** (Layout A4 de Recibo) | `_reversa_sdd/recibos/` | `features/maodeobra/components/ReciboA4Print.tsx` |

