# Tarefas de Implementação: Módulo Produção

> Especificação para Reconstrução / Migração  
> Fonte no Legado: `src/components/producao/ProducaoView.tsx`  
> Status: 🟢 CONFIRMADO

---

## Lista de Tarefas

- [ ] **PROD-01**: Implementar entidades e tipos de `ProducaoItem` e lista de `produtosProducao`. 🟢
  - *Origem*: `src/types/index.ts`
  - *Critério de Pronto*: Schema definido com suporte a dimensões (comprimento) e campos de destino/obra.

- [ ] **PROD-02**: Criar cabeçalho com indicadores consolidados (trilhos, placas, metros batidos e custo indicativo). 🟢
  - *Origem*: `ProducaoView.tsx:20-37`
  - *Critério de Pronto*: Cards de resumo com totalizadores reativos e formatados.

- [ ] **PROD-03**: Implementar formulário de cadastro e edição de lote de produção. 🟢
  - *Origem*: `ProducaoView.tsx:47-55`
  - *Critério de Pronto*: Validação condicional exigindo comprimento em metros quando for artefato linear/trilho.

- [ ] **PROD-04**: Implementar listagem e histórico de produção com filtros por tipo de produto e busca. 🟢
  - *Origem*: `ProducaoView.tsx`
  - *Critério de Pronto*: Tabela de lotes produzidos com data, especificação, quantidade, destino e ações de edição/exclusão.

- [ ] **PROD-05**: Implementar modal de gestão de tipos de produtos (adição, renomeação e exclusão). 🟢
  - *Origem*: `ProducaoView.tsx:60-140`
  - *Critério de Pronto*: Atualização em cascata de itens existentes ao renomear produto.

