# Requisitos do Módulo: Produção Própria

> Módulo: `producao`  
> Localização no Legado: `src/components/producao/ProducaoView.tsx`  
> Status: 🟢 CONFIRMADO

---

## 1. Visão Geral

O módulo **Produção** controla a fabricação interna de artefatos de cimento e insumos estruturais no canteiro de obras (como trilhos de laje e placas de concreto), acompanhando quantidades produzidas, comprimentos lineares batidos, destinos na obra e custos indicativos.

---

## 2. Requisitos Funcionais (MoSCoW)

### Must have (Crítico)
- **RF-PROD-01**: Cadastrar lançamento de produção contendo tipo de produto, quantidade produzida, comprimento em metros (obrigatório se trilho), data, destino/etapa e observações. 🟢
- **RF-PROD-02**: Listar histórico de lotes produzidos com filtros por tipo de produto e busca textual (destino, especificações ou observações). 🟢
- **RF-PROD-03**: Editar e excluir lançamentos de lotes produzidos. 🟢
- **RF-PROD-04**: Gerenciar catálogo de produtos de produção (cadastrar novos tipos de produtos, renomear com propagação e excluir). 🟢

### Should have (Importante)
- **RF-PROD-05**: Apresentar cards de totais consolidados no topo:
  - Total de trilhos produzidos
  - Total de placas produzidas
  - Total de metros lineares batidos
  - Custo indicativo por unidade/metro 🟢

### Won't have (Fora de escopo no legado)
- **RF-PROD-06**: Automação de sensores IoT ou pesagem automatizada de balança industrial. 🟢

---

## 3. Critérios de Aceitação (Gherkin)

```gherkin
Cenário: Cadastro de lote de trilhos de laje
  Dado que o usuário está no módulo "Produção"
  Quando clica em "Nova produção" e seleciona "Trilho de Laje" com quantidade 10 e comprimento "3.20" metros
  E informa o destino "Laje Piso Superior" e salva
  Então o lote é registrado no histórico
  E o total de metros lineares batidos é incrementado em 32.0 metros (10 * 3.20)
```

---

## 4. Requisitos Não Funcionais

- **Simplicidade Operacional**: Interface pensada para preenchimento ágil direto pelo encarregado ou mestre de obras. 🟢

