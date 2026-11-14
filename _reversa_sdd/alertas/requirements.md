# Unit: Central de Alertas e Pendências (alertas)

> Especificação de Requisitos da Central de Pendências e Inconsistências Operacionais.

## Visão Geral
Módulo responsável por monitorar, centralizar e exibir inconsistências operacionais e financeiras da obra, como compras sem comprovante anexado, despesas não vinculadas a cartões/faturas, divergências em rateios de notas fiscais e pagamentos pendentes de mão de obra. Permite a rápida resolução e direcionamento para a entidade afetada.

## Responsabilidades
- Listar todas as pendências e alertas ativos da obra.
- Categorizar os alertas por severidade (`alta`, `media`, `baixa`).
- Exibir estado amigável de vazio ("Tudo em dia!") quando não houver pendências ativas.
- Prover ação de resolução rápida de alerta com navegação direcionada para o módulo e entidade correspondente.

## Regras de Negócio
- Alertas são classificados por severidade:
  - `alta`: Exibidos com destaque visual avermelhado/laranja escuro e ícone de escudo de alerta 🟢.
  - `media`: Exibidos com destaque amarelado/âmbar e ícone de triângulo de atenção 🟢.
  - `baixa`: Exibidos com estilo padrão/azul e ícone de arquivo com interrogação 🟢.
- A resolução de um alerta executa atomicamente: remoção do alerta do estado ativo (`resolverAlerta`) e redirecionamento de tela com filtro pré-selecionado para a entidade em questão (`navigateToTabWithFilter`) 🟢.
- Caso o alerta não possua entidade vinculada, pode ser marcado como resolvido diretamente na lista 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listagem de Alertas Ativos | Must | Apresentar todas as pendências da obra com título, descrição, severidade e data |
| RF-02 | Resolução e Navegação Direta | Must | Botão "Resolver" remove o alerta e abre a tela de destino com a entidade selecionada |
| RF-03 | Empty State Positivo | Should | Exibir mensagem de conformidade quando a lista de alertas for vazia |
| RF-04 | Diferenciação Visual por Severidade | Should | Cores e ícones específicos para cada nível de severidade |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Feedback instantâneo sem recarregamento de página via atualização de estado React | `src/components/alertas/AlertasView.tsx:15-18` | 🟢 |
| Acessibilidade | Cores contrastantes e semântica de ícones para cada nível de criticidade | `src/components/alertas/AlertasView.tsx:54-78` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que existem alertas cadastrados com severidade "alta"
Quando o usuário visualiza a Central de Alertas
Então o card exibe borda avermelhada, ícone ShieldAlert e botão de ação direta

Dado que o usuário clica em "Resolver" de uma pendência vinculada a uma despesa
Quando a ação é confirmada
Então o alerta é retirado da lista e a aplicação abre a aba de despesas focando o registro afetado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Visualização e resolução de alertas | Must | Evita prejuízos financeiros e falta de comprovação fiscal |
| Navegação contextual direta | Should | Agiliza a rotina do conferente de notas e financeiro |
| Empty state informativo | Could | Confirmação explícita de saúde da obra |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/components/alertas/AlertasView.tsx` | `AlertasView` | 🟢 |
| `src/context/AppContext.tsx` | `alertas`, `resolverAlerta` | 🟢 |

