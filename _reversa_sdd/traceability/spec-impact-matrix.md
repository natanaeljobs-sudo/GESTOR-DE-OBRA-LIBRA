# Spec Impact Matrix — SISTEMA LIBRA - OBRAS

> Gerado pelo **Architect** em 2026-11-13

A tabela abaixo mapeia a interdependência entre os componentes/módulos do sistema. Caso um módulo de origem sofra alterações estruturais ou de contrato, os módulos impactados devem ser verificados e testados.

---

| Módulo de Origem | Módulos Impactados Diretamente | Natureza do Impacto | Severidade |
|------------------|--------------------------------|---------------------|------------|
| **`AppContext`** (Estado Global) | Todos os módulos | Quebra de contratos de dados, métodos CRUD e sincronização de telas | Crítica 🔴 |
| **`despesas`** | `dashboard`, `alertas`, `cartoes`, `relatorios` | Afeta totalizadores de gastos, pendências de rateio, faturas e relatórios | Alta 🟠 |
| **`maodeobra`** | `dashboard`, `recibos`, `alertas`, `relatorios` | Afeta cálculo de diárias, teto de mão de obra e quitação de recibos | Alta 🟠 |
| **`recibos`** | `maodeobra`, `relatorios` | Altera status das diárias (`pendente` ↔ `pago`) e históricos de pagamento | Média 🟡 |
| **`cartoes`** | `despesas`, `alertas`, `dashboard` | Fluxo de caixa de parcelas a vencer/atrasadas e compras sem cartão | Média 🟡 |
| **`orcamentos`** | `despesas`, `materiais` | Conversão direta de cotação em despesa com cópia de itens | Média 🟡 |
| **`materiais`** | `despesas`, `orcamentos`, `producao` | Nomes padronizados, unidades de medida e sugestão de categorias | Baixa 🟢 |
| **`etapas` / `obra`** | `dashboard`, `despesas`, `maodeobra`, `relatorios` | Estrutura de agrupamento e centros de custo de toda a obra | Alta 🟠 |
| **`usuarios` / `auth`** | Todos os módulos | Controle de visibilidade e permissões de ação (`criar`, `editar`, `excluir`) | Alta 🟠 |

