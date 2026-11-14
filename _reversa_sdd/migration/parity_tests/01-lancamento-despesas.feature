# language: pt
# spec-id: PAR-01
# legacy-flow: src/components/despesas/DespesasView.tsx
# target-architecture: REST / Supabase DB (despesas)
# tags: @paridade @critico

Funcionalidade: Lançamento e Persistência de Despesa de Obra
  Como gestor de obra
  Quero registrar uma nova despesa
  Para que o saldo da obra e os alertas sejam atualizados com integridade

  Cenário: Registro de despesa com sucesso
    Dado que a obra "Residencial Jardins" está cadastrada e ativa
    E o usuário está autenticado com permissão "admin"
    Quando o usuário lança uma despesa de R$ 1.500,00 na categoria "Materiais" com data de hoje
    Então a despesa deve ser salva com status "pendente"
    E o saldo total da obra deve refletir o acréscimo de R$ 1.500,00
    E a lista de despesas da obra deve conter o novo registro imediatamente

  Cenário: Tentativa de lançamento sem valor válido
    Dado que o usuário está no formulário de nova despesa
    Quando submete uma despesa com valor R$ 0,00 ou negativo
    Então o sistema deve recusar o lançamento com mensagem "O valor deve ser maior que zero"
    E nenhum registro deve ser gravado no banco de dados

