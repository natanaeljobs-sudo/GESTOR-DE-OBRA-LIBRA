# Tarefas de Implementação: Módulo Materiais

> Especificação para Reconstrução / Migração  
> Fonte no Legado: `src/components/materiais/MateriaisView.tsx`  
> Status: 🟢 CONFIRMADO

---

## Lista de Tarefas

- [ ] **MAT-01**: Implementar entidade e tipos de `Material`, `UnidadeMedida` e `CategoriaMaterial`. 🟢
  - *Origem*: `src/types/index.ts`
  - *Critério de Pronto*: Tipos TypeScript ou schemas definidos com validação de campos obrigatórios.

- [ ] **MAT-02**: Criar visualização de listagem e busca reativa com filtros de unidade e status de compras. 🟢
  - *Origem*: `src/components/materiais/MateriaisView.tsx`
  - *Critério de Pronto*: Tabela listando materiais com nome, unidade, quantidade de compras vinculadas e último valor unitário.

- [ ] **MAT-03**: Implementar modais de criação e edição de material com feedback visual. 🟢
  - *Origem*: `MateriaisView.tsx:664-850`
  - *Critério de Pronto*: Inclusão e atualização persistida no repositório/contexto de materiais.

- [ ] **MAT-04**: Implementar agregação e exibição do histórico de compras por material a partir dos lançamentos de despesas. 🟢
  - *Origem*: `MateriaisView.tsx:90-186`
  - *Critério de Pronto*: Modal de histórico apresentando data, fornecedor, quantidade, valor unitário e total.

- [ ] **MAT-05**: Implementar modais de gestão de unidades de medida e categorias com suporte a edição em cascata. 🟢
  - *Origem*: `MateriaisView.tsx:253-345`
  - *Critério de Pronto*: Inclusão, renomeação com propagação para materiais existentes e exclusão.

