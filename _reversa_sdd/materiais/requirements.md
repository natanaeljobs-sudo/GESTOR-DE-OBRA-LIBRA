# Requisitos do Módulo: Materiais

> Módulo: `materiais`  
> Localização no Legado: `src/components/materiais/`  
> Status: 🟢 CONFIRMADO

---

## 1. Visão Geral

O módulo **Materiais** gerencia o catálogo central de insumos, ferramentas e produtos da obra. Permite o cadastro, edição, exclusão e consulta de materiais com unidades de medida e categorias associadas, além de fornecer histórico consolidado de compras a partir dos lançamentos do módulo de `despesas`.

---

## 2. Requisitos Funcionais (MoSCoW)

### Must have (Crítico)
- **RF-MAT-01**: Cadastrar material com nome obrigatório, unidade de medida padrão e categoria sugerida opcional. 🟢
- **RF-MAT-02**: Listar materiais com filtragem por busca textual (nome, categoria, unidade), filtro por unidade de medida e filtro por status de compras (`todos`, `com compras`, `sem compras`). 🟢
- **RF-MAT-03**: Editar dados do material (nome, unidade padrão, categoria, data de cadastro). 🟢
- **RF-MAT-04**: Excluir material cadastrado (com confirmação em modal). 🟢
- **RF-MAT-05**: Gerenciar unidades de medida (adicionar, renomear com atualização em cascata nos materiais vinculados, e excluir). 🟢
- **RF-MAT-06**: Gerenciar categorias de materiais (adicionar, renomear com atualização em cascata nos materiais vinculados, e excluir). 🟢

### Should have (Importante)
- **RF-MAT-07**: Visualizar histórico detalhado de compras do material filtrado e ordenado cronologicamente a partir das despesas cadastradas na obra ou globalmente. 🟢
- **RF-MAT-08**: Calcular dinamicamente o último preço pago, preço médio, menor preço e maior preço unitário para cada material. 🟢

### Could have (Desejável)
- **RF-MAT-09**: Exibir atalhos para abrir despesa de origem da compra diretamente da listagem de histórico. 🟢

### Won't have (Fora de escopo no legado)
- **RF-MAT-10**: Controle físico de estoque com saldo em tempo real e baixa automática por consumo de etapa (não implementado no legado, o sistema foca em compras/despesas). 🟢

---

## 3. Critérios de Aceitação (Gherkin)

```gherkin
Cenário: Cadastro de novo material com sucesso
  Dado que o usuário está no módulo "Materiais"
  Quando clica em "Novo material" e preenche o nome "Tijolo 8 Furos", seleciona a unidade "MILHEIRO" e salva
  Então o material é persistido na lista com id único e data de cadastro atual
  E uma mensagem de confirmação de cadastro é exibida

Cenário: Renomeação de unidade de medida com atualização em cascata
  Dado que existem materiais vinculados à unidade "UNIDADE"
  Quando o usuário abre o modal de unidades e altera o nome para "UN"
  Então todos os materiais que usavam "UNIDADE" passam a exibir "UN"
  E as despesas que utilizam essa unidade permanecem íntegras
```

---

## 4. Requisitos Não Funcionais

- **Usabilidade**: Interface com modais rápidos, busca reativa em tempo real via `useMemo` sem requisição a servidor. 🟢
- **Concorrência / Integridade**: No estado atual, as alterações são salvas no `AppContext` (memória / localStorage). 🟢

