# Unit: Gestão de Cartões e Contas (cartoes)

> Especificação de Requisitos para o Controle de Cartões de Crédito, Contas Bancárias/PIX e Gestão de Parcelas da Obra.

## Visão Geral
O módulo `cartoes` é responsável pela administração de métodos de pagamento vinculados à obra (cartões de crédito corporativos/pessoais e contas correntes para PIX), bem como pelo acompanhamento detalhado de parcelamentos oriundos de compras e despesas. Ele consolida faturas correntes, vencimentos futuros, status de liquidação (paga vs. a vencer) e alerta sobre compras com formas de pagamento pendentes.

## Responsabilidades
- Cadastro, edição e exclusão de cartões de crédito e contas bancárias (com chave PIX).
- Apresentação em formato de carrossel visual e responsivo dos cartões cadastrados e suas faturas calculadas.
- Listagem, filtragem por período (mensal vs. todo o período) e paginação de parcelas vinculadas aos cartões.
- Manutenção manual de parcelas (edição de valor, vencimento, descrição, cartão vinculado e status de quitação).
- Notificação sobre compras pendentes de vínculo de cartão com navegação direta para a aba de despesas.

## Regras de Negócio
- **Tipo de Registro:** Um registro pode ser um Cartão de Crédito (`tipo: 'credito'`) ou Conta Bancária/PIX (`tipo: 'conta_corrente'`, `isConta: true`) 🟢.
- **Cálculo da Fatura:** O valor da fatura de cada cartão corresponde ao somatório das parcelas com status `a_vencer` ou `em_atraso` atreladas àquele cartão 🟢.
- **Filtro Temporal:** Parcelas podem ser visualizadas por mês/ano específico ou no acumulado histórico total da obra 🟢.
- **Status da Parcela:** Uma parcela pode estar `a_vencer` ou `paga`. A alteração do status impacta diretamente os totais quitados e faturas pendentes 🟢.
- **Integração com Despesas:** Despesas cadastradas sem forma de pagamento ou cartão vinculado geram aviso persistente de "Compra Pendente" com atalho para regularização 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastro de Cartões e Contas | Must | Permitir cadastrar cartão (apelido, bandeira, 4 dígitos, dia fechamento/vencimento, limite, titular) ou conta (banco, tipo de chave, chave PIX, agência) |
| RF-02 | Edição e Exclusão de Cartões | Must | Permitir alterar parâmetros do cartão ou excluí-lo da obra com confirmação |
| RF-03 | Visualização de Faturas no Carrossel | Must | Exibir cards visuais estilizados com dados da bandeira, titular e cálculo de fatura aberta |
| RF-04 | Gestão de Parcelas | Must | Listar parcelas com descrição, cartão de origem, número da parcela, vencimento, valor e badge de status |
| RF-05 | Edição e Exclusão de Parcelas | Should | Modal para alterar valores, datas, cartão ou status da parcela, bem como exclusão de registros |
| RF-06 | Filtro de Período da Obra | Should | Alternância rápida entre "Todo o Período" e "Mês / Ano" específico com paginação dinâmica de 5 itens |
| RF-07 | Alerta de Compras Pendentes | Should | Banner de alerta no topo informando compras sem cartão ou parcelamento com redirecionamento |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance / UX | Carrossel suave com navegação horizontal touch/botões e indicador de página no mobile | `src/components/cartoes/CartoesView.tsx:381-395` | 🟢 |
| Usabilidade | Feedback com toasts animados e auto-dismiss (3.5s) para todas as operações de mutação | `src/components/cartoes/CartoesView.tsx:273-282` | 🟢 |
| Formatação | Exibição de valores monetários estritamente no padrão BRL e datas no padrão `DD/MM/YYYY` | `src/components/cartoes/CartoesView.tsx:5-59` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o usuário visualiza o módulo de Cartões
Quando seleciona o período "Mês / Ano" e escolhe Novembro/2026
Então apenas as parcelas com data de vencimento no mês 11 de 2026 são listadas na tabela

Dado que existe uma parcela com status "a_vencer" no valor de R$ 1.616,83
Quando o usuário edita a parcela e altera o status para "paga"
Então o total a vencer do cartão diminui em R$ 1.616,83 e o total quitado é acrescido do mesmo valor

Dado que o usuário clica em "Cadastrar Cartão / Conta" e escolhe tipo "Conta Bancária"
Quando preenche banco, agência, chave PIX e confirma
Então uma nova conta é incluída no carrossel com badge "PIX" e chave informada
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cadastro de cartões/contas e controle de faturas | Must | Indispensável para o fluxo de caixa e provisionamento de capital na obra |
| Baixa e controle de parcelas a vencer | Must | Garante que pagamentos não sofram juros por atraso |
| Filtros por competência/mês | Should | Facilita a conferência com faturas reais de cartão de crédito |
| Indicador de compras pendentes de vínculo | Should | Rastreabilidade entre a nota lançada e o cartão que pagou |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/components/cartoes/CartoesView.tsx` | `CartoesView` (Gestão de Cartões, Contas e Parcelas) | 🟢 |
| `src/types/index.ts` | Interfaces `CartaoConta`, `Parcela` | 🟢 |
| `src/utils/currency.ts` | Formatação de moeda BRL | 🟢 |

