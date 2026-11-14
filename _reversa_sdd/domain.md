# Conhecimento de Domínio e Regras de Negócio — SISTEMA LIBRA - OBRAS

> Gerado pelo **Detective** em 2026-11-13

---

## Glossário do Domínio

- **Obra:** Empreendimento de construção civil gerenciado no sistema, com orçamento total, teto de mão de obra e etapas sequenciais. 🟢 CONFIRMADO
- **Etapa:** Fase construtiva da obra (ex.: fundação, alvenaria, acabamento) com ordem sequencial (`numero`) e orçamento previsto opcional. 🟢 CONFIRMADO
- **Despesa:** Lançamento financeiro (nota fiscal ou compra) vinculado a uma obra, etapa, fornecedor e forma de pagamento, composto por um ou mais itens. 🟢 CONFIRMADO
- **Rateio de Itens:** Distribuição dos itens de uma despesa por etapa e destino (`obra`, `producao_trilhos`, `outra_obra`, `estoque_geral`). 🟢 CONFIRMADO
- **Diária:** Registro de trabalho diário de um trabalhador, calculado por fração (`0.5`, `1.0`, `1.5`) sobre o valor base, somado a eventuais adicionais. 🟢 CONFIRMADO
- **Recibo de Pagamento:** Documento formal emitido para quitar um conjunto de diárias pendentes, contendo valor por extenso e numeração sequencial/customizável. 🟢 CONFIRMADO
- **Produção Própria:** Controle de insumos fabricados na própria obra (ex.: trilhos de laje, placas). 🟢 CONFIRMADO
- **Orçamento (Cotação):** Proposta de fornecedor que pode ser aprovada e convertida diretamente em despesa. 🟢 CONFIRMADO

---

## Regras de Negócio Implícitas

1. **Conferência Automática de Rateio:** Ao lançar ou editar uma `Despesa`, o sistema calcula `diferencaRateio = valorTotalNota - valorSomaItens`. Se `diferencaRateio !== 0`, o `statusConferencia` é marcado como `'diferenca_rateio'` e um `AlertaPendencia` é gerado. 🟢 CONFIRMADO
2. **Cálculo de Diária:** O valor da diária é `valorCalculado = fracao * valorDiariaBase` e `valorTotal = valorCalculado + valorAdicional`. Frações permitidas: `0.5` (meia diária), `1.0` (diária integral) e `1.5` (diária + hora extra/meia). 🟢 CONFIRMADO
3. **Quitação de Diárias via Recibo:** A emissão de um `ReciboPagamento` vincula `diariasIds` e altera o `statusPagamento` das diárias selecionadas de `'pendente'` para `'pago'`, registrando `reciboId` e `dataPagamento`. 🟢 CONFIRMADO
4. **Teto de Mão de Obra:** A `Obra` define `tetoMaoDeObra`. Quando o somatório das diárias se aproxima ou ultrapassa esse teto, o sistema gera alerta (`teto_orcamento`). 🟡 INFERIDO
5. **Conversão de Orçamento em Despesa:** Um `Orcamento` com status `'aprovado'` pode ser convertido em `Despesa`, alterando seu status para `'convertido_em_compra'` e preenchendo `despesaConvertidaId`. 🟢 CONFIRMADO
6. **Alertas de Pendência:** O módulo de alertas monitora automaticamente: diferenças de rateio, despesas sem comprovante (`sem_comprovante`), compras no cartão sem cartão vinculado (`sem_cartao`), diárias pendentes (`diarias_pendentes`) e estouro de teto (`teto_orcamento`). 🟢 CONFIRMADO
7. **Autenticação Simulada:** O login atual busca usuários por e-mail, nome ou ID diretamente no estado em memória, sem validação de senha ou token JWT. 🟢 CONFIRMADO

---

## Lacunas Identificadas

- 🔴 **LACUNA:** Regras de fechamento de fatura de cartão de crédito (`diaFechamento` vs `diaVencimento`) na geração automática de `Parcela` precisam de validação com o usuário.
- 🔴 **LACUNA:** Política de bloqueio ou apenas alerta quando `tetoMaoDeObra` ou `orcamentoTotal` é ultrapassado.

