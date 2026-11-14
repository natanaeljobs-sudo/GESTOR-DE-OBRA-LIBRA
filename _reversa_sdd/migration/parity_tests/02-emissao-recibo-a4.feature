# language: pt
# spec-id: PAR-02
# legacy-flow: src/utils/reciboPrintService.ts
# target-architecture: CSS Print A4 / Printable View
# tags: @paridade @critico @paridade-visual

Funcionalidade: Emissão e Impressão de Recibo A4 de Mão de Obra
  Como gestor de obra
  Quero emitir um recibo formal de pagamento
  Para comprovar a quitação da mão de obra em folha física A4

  Cenário: Geração de recibo e conferência de dados legais
    Dado que existe um pagamento registrado para o prestador "João da Silva" no valor de R$ 850,00
    Quando o usuário aciona a visualização/impressão do recibo
    Então o documento deve exibir o nome do prestador, valor numérico e valor por extenso
    E o layout deve estar formatado para folha A4 com quebra de página precisa
    E deve conter o campo para assinatura do prestador e data de emissão

