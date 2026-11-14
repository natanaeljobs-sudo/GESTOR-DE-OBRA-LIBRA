# Requisitos do Módulo: Orçamentos e Cotações

> Módulo: `orcamentos`  
> Localização no Legado: `src/components/orcamentos/OrcamentosView.tsx`  
> Status: 🟢 CONFIRMADO

---

## 1. Visão Geral

O módulo **Orçamentos** é responsável pela cotação de insumos e serviços junto a fornecedores, comparação de preços, aprovação/rejeição de propostas comerciais e conversão direta de orçamentos aprovados em despesas com itens rateados.

---

## 2. Requisitos Funcionais (MoSCoW)

### Must have (Crítico)
- **RF-ORC-01**: Cadastrar cotação/orçamento com número, fornecedor/empresa, identificador comercial, data, etapa vinculada, status (`cotacao`, `aprovado`, `recusado`), condições de pagamento, frete e itens cotados. 🟢
- **RF-ORC-02**: Gerenciar itens do orçamento contendo nome do material, quantidade, unidade, preço unitário cotado e subtotal calculado. 🟢
- **RF-ORC-03**: Listar orçamentos com filtros por status (`todos`, `cotacao`, `aprovado`, `recusado`), etapa e busca textual por fornecedor ou identificador. 🟢
- **RF-ORC-04**: Alterar status do orçamento entre cotação, aprovado e recusado. 🟢
- **RF-ORC-05**: Converter orçamento aprovado em despesa real vinculada à obra atual, gerando automaticamente os itens e rateios. 🟢

### Should have (Importante)
- **RF-ORC-06**: Comparador de cotações lado a lado destacando menor preço unitário e menor valor total por item e fornecedor. 🟢
- **RF-ORC-07**: Gestão de frete (indicação se possui frete, valor cobrado e prazo de entrega no canteiro). 🟢

### Could have (Desejável)
- **RF-ORC-08**: Exportação e impressão de espelho do orçamento para aprovação formal. 🟢

---

## 3. Critérios de Aceitação (Gherkin)

```gherkin
Cenário: Aprovação de orçamento e conversão em despesa
  Dado que um orçamento com id "orc-01" está com status "cotacao"
  Quando o usuário altera o status para "aprovado" e aciona a conversão em despesa
  Então uma nova despesa é criada no AppContext com os itens e valores do orçamento
  E o status do orçamento reflete como "aprovado"

Cenário: Comparativo de preços de materiais entre fornecedores
  Dado que existem 3 orçamentos cadastrados para os mesmos materiais ("Cimento CP II 50kg")
  Quando o usuário visualiza o comparativo de itens
  Então o sistema destaca visualmente a proposta com menor valor unitário
```

---

## 4. Requisitos Não Funcionais

- **Precisão de Cálculo**: Os totais e subtotais devem somar itens e frete com precisão decimal em BRL. 🟢
- **Integração**: Acoplamento direto com o módulo `despesas` e catálogo `materiais`. 🟢

