# Tarefas de Implementação: Módulo Orçamentos

> Especificação para Reconstrução / Migração  
> Fonte no Legado: `src/components/orcamentos/OrcamentosView.tsx`  
> Status: 🟢 CONFIRMADO

---

## Lista de Tarefas

- [ ] **ORC-01**: Implementar entidades e tipos de `Orcamento` e `ItemOrcamento`. 🟢
  - *Origem*: `src/types/index.ts`
  - *Critério de Pronto*: Tipagem completa com status `cotacao`, `aprovado` e `recusado`.

- [ ] **ORC-02**: Criar visualização de listagem de orçamentos com métricas e filtros. 🟢
  - *Origem*: `OrcamentosView.tsx:35-250`
  - *Critério de Pronto*: Tabela e cards de orçamentos com badges coloridas por status e valores formatados.

- [ ] **ORC-03**: Implementar formulário de cadastro e edição de orçamento com múltiplos itens dinâmicos. 🟢
  - *Origem*: `OrcamentosView.tsx`
  - *Critério de Pronto*: Adição dinâmica de linhas de materiais, cálculo em tempo real de subtotais e frete.

- [ ] **ORC-04**: Implementar fluxo de alteração de status (aprovar / recusar) e conversão em despesa. 🟢
  - *Origem*: `OrcamentosView.tsx`
  - *Critério de Pronto*: Ação de aprovar que cria a despesa correspondente na obra ativa e vincula itens.

- [ ] **ORC-05**: Implementar visualização comparativa de cotações entre fornecedores concorrentes. 🟢
  - *Origem*: `OrcamentosView.tsx`
  - *Critério de Pronto*: Tabela comparativa destacando os menores preços praticados por insumo.

