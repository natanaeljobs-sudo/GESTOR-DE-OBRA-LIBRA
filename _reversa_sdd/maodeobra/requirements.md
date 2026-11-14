# Unit: Gestão de Mão de Obra e Diárias (maodeobra)

> Especificação de Requisitos para o Controle Semanal de Diárias, Trabalhadores e Monitoramento do Teto de Mão de Obra.

## Visão Geral
O módulo `maodeobra` gerencia a equipe de execução da obra (pedreiros, serventes, encarregados, eletricistas), controlando os lançamentos diários de jornada de trabalho (frações de 0.5 a 1.5 diárias), bonificações/valores adicionais, apuração semanal para fechamento financeiro, geração de recibos formais e monitoramento contínuo do Teto Fechado de Mão de Obra estipulado para a construção.

## Responsabilidades
- Cadastro e manutenção de trabalhadores com função, CPF, chave PIX e valor base de diária padrão.
- Lançamento, edição e exclusão de diárias com cálculo dinâmico ($\text{fração} \times \text{valorBase} + \text{adicional}$).
- Apuração semanal estruturada com paginação deslizante por semanas (windowing até 5 botões de navegação).
- Monitoramento em tempo real do Teto Fechado de Mão de Obra da obra (teto total, valor pago, valor a pagar e saldo remanescente).
- Agrupamento de diárias pendentes para exportação e geração de recibos no módulo `recibos`.

## Regras de Negócio
- **Fração de Diária:** As frações padrão aceitas são $0.5$ (meia diária), $1.0$ (diária integral) e $1.5$ (diária estendida/hora extra) 🟢.
- **Cálculo da Diária:**
  $$\text{valorCalculado} = \text{fracao} \times \text{valorDiariaBase}$$
  $$\text{valorTotal} = \text{valorCalculado} + \text{valorAdicional}$$ 🟢.
- **Teto Fechado de Mão de Obra:**
  - O teto orçado da obra (ex.: R$ 32.000,00 na Obra Juscelino Mola) é consumido conforme o somatório de todas as diárias lançadas 🟢.
  - A barra de progresso do teto exibe visualmente a proporção do valor já pago (`totalPagas`) e do valor provisionado a pagar (`totalPendentes`) 🟢.
- **Agrupamento Semanal:** As diárias são organizadas cronologicamente em semanas (de segunda-feira a domingo), permitindo controle de fechamento pontual 🟢.
- **Status do Pagamento:** Cada diária possui status `pendente` ou `pago`. A quitação pode ser manual ou automatizada via emissão de recibo 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cadastro de Trabalhadores | Must | Modal para inclusão de trabalhador com nome, função, diária base, chave PIX e CPF |
| RF-02 | Lançamento e Edição de Diária | Must | Registro com trabalhador, data, fração, valor base (com auto-preenchimento), adicional e etapa |
| RF-03 | Controle do Teto de Mão de Obra | Must | Card gerencial com totais (Pago, A Pagar, Saldo) e barra bi-colorida de consumo do teto |
| RF-04 | Navegação Semanal Paginada | Must | Agrupamento por semana civil com paginação sliding window (até 5 botões numéricos) |
| RF-05 | Filtragem por Trabalhador e Status | Should | Filtro seletivo de trabalhador e comutador rápido entre Todos, A Pagar e Pagos |
| RF-06 | Integração com Recibos | Should | Botão direto de redirecionamento para o módulo `recibos` para quitação e emissão |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade Mobile | Layout adaptativo que troca tabela densa por cards individuais no mobile | `src/components/maodeobra/MaoDeObraView.tsx:310-342, 789-800` | 🟢 |
| Precisão Monetária | Precisão decimal estrita em cálculos de fração e valores adicionais | `src/components/maodeobra/MaoDeObraView.tsx:221-224` | 🟢 |
| Feedback | Toast notifications explicativos ao salvar ou editar lançamentos | `src/components/maodeobra/MaoDeObraView.tsx:48-53, 240, 257` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o trabalhador "João Pedreiro" tem diária padrão de R$ 180,00
Quando o usuário seleciona João, fração de 0.5 e adicional de R$ 20,00 por café/transporte
Então o valor total calculado da diária resulta em R$ 110,00

Dado que o teto da obra é R$ 32.000,00 e o total de diárias lançadas atinge R$ 16.000,00
Quando o usuário visualiza o card de Teto de Mão de Obra
Então a barra indica 50% de consumo do teto e saldo disponível de R$ 16.000,00
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Apuração de diárias e controle de semanas | Must | Base do fechamento de folha semanal na construção |
| Monitoramento do teto financeiro | Must | Evita estouro do contrato global de mão de obra |
| Cadastro e PIX dos trabalhadores | Should | Agiliza transferências bancárias semanais |
| Atalho para emissão de recibo | Should | Garante comprovação jurídica das diárias pagas |

## Rastreabilidade de Código

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/components/maodeobra/MaoDeObraView.tsx` | `MaoDeObraView` | 🟢 |
| `src/context/AppContext.tsx` | `trabalhadores`, `diarias`, `addDiaria`, `updateDiaria`, `addTrabalhador` | 🟢 |
| `src/types/index.ts` | Interfaces `Trabalhador`, `Diaria` | 🟢 |
| `src/utils/date.ts` | Utilitários de cálculo de intervalo de semanas (`getWeekRange`) | 🟢 |

