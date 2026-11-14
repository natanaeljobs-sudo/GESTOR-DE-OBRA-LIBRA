# language: pt
# spec-id: PAR-03
# legacy-flow: src/components/alertas/AlertasView.tsx
# target-architecture: Business Rules Engine / SQL Views
# tags: @paridade @critico

Funcionalidade: Disparo Automático de Alertas de Orçamento Excedido
  Como engenheiro responsável
  Quero ser alertado quando os gastos ultrapassarem o teto planejado
  Para evitar estouro de custos na execução da obra

  Cenário: Alerta disparado quando despesas superam orçamento
    Dado que a obra "Edifício Aurora" possui orçamento total de R$ 100.000,00
    E o acumulado de despesas atingiu R$ 100.500,00
    Quando o motor de regras processa a atualização dos totais da obra
    Então um alerta de severidade "alta" com tipo "ORCAMENTO_EXCEDIDO" deve ser gerado
    E o card de alertas no Dashboard deve exibir a notificação em destaque

