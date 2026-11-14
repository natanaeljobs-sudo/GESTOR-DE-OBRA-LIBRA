# Unit: Gestão de Despesas e Rateio de Notas (despesas)

> Especificação de Requisitos para Lançamento de Compras, Itens Discriminados, Conferência de Rateio e Formas de Pagamento.

## Visão Geral
O módulo `despesas` gerencia todas as saídas financeiras referentes a materiais, equipamentos, fretes e insumos operacionais. Seu principal diferencial é a decomposição por itens discriminados de cada nota fiscal/recibo, associando cada insumo a uma etapa construtiva ou a um destino específico (ex.: Produção de Trilhos, Estoque Geral), permitindo o batimento de valores (conferência entre a soma dos itens e o valor total declarado da nota fiscal).

## Responsabilidades
- Lançamento, alteração e exclusão de notas fiscais/despesas.
- Registro detalhado de múltiplos itens por nota com quantidade, unidade de medida, valor unitário e total.
- Cálculo automático da diferença de rateio ($\text{Valor Total da Nota} - \sum \text{Itens}$) e rotulagem de status de conferência.
- Cadastro rápido/inline de novos materiais no catálogo sem dependência de navegação prévia.
- Associação com etapas da obra e destinação específica de insumos.
- Associação com formas de pagamento (Pix, Cartão de Crédito/Parcelas, Dinheiro, Boleto, Não Informado) e armazenamento de comprovantes (OneDrive).

## Regras de Negócio
- **Status de Conferência da Nota:**
  - Se $|\text{diferencaRateio}| \le 0.05$: Status `ok` 🟢.
  - Se $|\text{diferencaRateio}| > 0.05$: Status `diferenca_rateio` com destaque visual e geração de alerta operacional 🟢.
- **Forma de Pagamento Cartão de Crédito:**
  - Quando selecionado `cartao_credito`, torna-se obrigatória/sugerida a seleção do cartão específico e o número de parcelas (1 a 24) 🟢.
- **Cálculo Dinâmico de Item:**
  - Alterações na quantidade ou no valor unitário recalculam instantaneamente o subtotal do item ($\text{quantidade} \times \text{valorUnitario}$) com precisão de duas casas decimais 🟢.
- **Associação de Destino:**
  - Cada item individual de uma nota pode ser endereçado para `obra`, `producao_trilhos`, `outra_obra` ou `estoque_geral` 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastro de Despesa com Itens | Must | Permitir preencher cabeçalho e N itens por nota, calculando a soma e a diferença em tempo real |
| RF-02 | Filtragem e Busca Multifacetada | Must | Busca textual (descrição, fornecedor, material) cumulativa com filtros de Categoria e Etapa da Obra |
| RF-03 | Cadastro Inline de Material | Should | Botão "+ Cadastrar Material Novo" no modal que insere o insumo diretamente no catálogo e já seleciona na linha ativa |
| RF-04 | Anexo de Comprovante Cloud | Should | Campo para URL de comprovante/OneDrive com botão de acesso direto via ícone de link externo |
| RF-05 | Edição e Exclusão Completa | Must | Capacidade de editar qualquer dado ou excluir a nota com todos os seus itens associados |
| RF-06 | Integração com Parcelamento | Must | Seleção de cartão e número de parcelas para direcionamento ao módulo de Cartões |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade / Precisão | Tratamento de arredondamento de moeda e cálculo com precisão `toFixed(2)` | `src/components/despesas/DespesasView.tsx:145-147, 198` | 🟢 |
| Usabilidade | Formulário responsivo com scroll de itens e indicador visual dinâmico de diferença de rateio | `src/components/despesas/DespesasView.tsx:689-800` | 🟢 |
| Performance | Filtragem em memória instantânea sobre a coleção de despesas e itens | `src/components/despesas/DespesasView.tsx:229-245` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o usuário informa um Valor Total de Nota de R$ 500,00
E adiciona itens que somam R$ 450,00
Quando o usuário salva a despesa
Então o statusConferencia é registrado como "diferenca_rateio" e a diferença de R$ 50,00 é exibida em destaque

Dado que o usuário cria um novo material inline com nome "Tubo PVC 100mm" e unidade "m"
Quando salva o material
Então o material é inserido no catálogo global e imediatamente selecionado no item corrente
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Registro de despesas e rateio de itens | Must | Núcleo do controle de custos da construção civil |
| Conferência de notas fiscais | Must | Evita divergências fiscais e extravio de insumos |
| Links para OneDrive/Comprovantes | Should | Auditoria rápida sem necessidade de armazenamento pesado no banco local |
| Filtro combinado por etapa e categoria | Should | Permite saber o custo exato de cada fase da obra |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/components/despesas/DespesasView.tsx` | `DespesasView` | 🟢 |
| `src/context/AppContext.tsx` | `despesas`, `addDespesa`, `updateDespesa`, `deleteDespesa`, `addMaterial` | 🟢 |
| `src/types/index.ts` | Interfaces `Despesa`, `ItemDespesa`, `CategoriaDespesa`, `DestinoItem` | 🟢 |

