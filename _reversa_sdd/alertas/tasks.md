# Unit: Central de Alertas e Pendências (alertas), Tarefas de Implementação

> Sequência de tarefas executáveis para implementação do módulo de Alertas.

## Pré-requisitos
- [x] Definição da interface `Alerta` no modelo de dados
- [x] Suporte a `resolverAlerta` e `navigateToTabWithFilter` no `AppContext`
- [x] Utilitário `formatDateBR` disponível

## Tarefas

- [ ] T-01: Implementar o Cabeçalho da Central de Pendências
  - Origem no legado: `src/components/alertas/AlertasView.tsx:24-31`
  - Critério de pronto: Título e descrição resumida do módulo
  - Confiança: 🟢

- [ ] T-02: Implementar o Card de Estado Vazio (Empty State de Sucesso)
  - Origem no legado: `src/components/alertas/AlertasView.tsx:33-45`
  - Critério de pronto: Exibir ícone `CheckCircle2` e texto tranquilizador quando `alertas.length === 0`
  - Confiança: 🟢

- [ ] T-03: Implementar a Lista de Cards de Alerta com Estilização por Severidade
  - Origem no legado: `src/components/alertas/AlertasView.tsx:47-105`
  - Critério de pronto: Renderizar alertas com cores, bordas e ícones correspondentes (`alta`, `media`, `baixa`)
  - Confiança: 🟢

- [ ] T-04: Implementar a Ação de Resolução e Redirecionamento
  - Origem no legado: `src/components/alertas/AlertasView.tsx:15-18, 106-125`
  - Critério de pronto: Clique no botão aciona `resolverAlerta` e `navigateToTabWithFilter`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01: Teste de renderização do empty state quando a lista for vazia
- [ ] TT-02: Teste de renderização dos cards com severidade alta, média e baixa
- [ ] TT-03: Teste de disparo da função de resolução e navegação com parâmetros corretos

## Ordem Sugerida
1. T-01 e T-02 (esqueleto e estado padrão).
2. T-03 e T-04 (listagem e ações de interação).

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica encontrada.

