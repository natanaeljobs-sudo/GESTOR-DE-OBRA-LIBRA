# Unit: Painel Geral (dashboard), Design Técnico

> Especificação Técnica e Arquitetura do Componente de Dashboard.

## Interface

### Componente React
- `DashboardView: React.FC`
  - Não recebe props diretas; consome todo o estado operacional via hook `useApp()`.

### Propriedades e Métricas Consumidas (`useApp`)

| Símbolo / Propriedade | Tipo | Descrição / Origem |
|-----------------------|------|--------------------|
| `activeObra` | `Obra` | Obra atualmente selecionada no cabeçalho |
| `etapas` | `EtapaObra[]` | Coleção de etapas cadastradas para a obra |
| `totalGeralObra` | `number` | Soma total consolidada de despesas e custos da obra |
| `totaisPorCategoria` | `Record<string, number>` | Totais agregados (materiais, mão de obra, produção, etc.) |
| `totalMaoDeObra` | `number` | Total comprometido com mão de obra |
| `totalMaoDeObraPaga` | `number` | Parcela de mão de obra já quitada |
| `totalMaoDeObraPendente`| `number` | Parcela de mão de obra em aberto |
| `saldoTetoMaoDeObra` | `number` | Valor restante até atingir o teto contratual |
| `totalAPagar` | `number` | Total geral de despesas e obrigações pendentes de pagamento |
| `totalTrilhosProduzidos`| `number` | Quantidade de trilhos fabricados |
| `totalPlacasProduzidas` | `number` | Quantidade de placas fabricadas |
| `custoIndicativoTrilho` | `number` | Custo médio estimado de fabricação por trilho |
| `despesas` | `Despesa[]` | Lista geral de despesas para extração dos 4 últimos registros |
| `diarias` | `Diaria[]` | Lista de diárias para extração dos 4 últimos registros |
| `navigateToTabWithFilter`| `(tab: TabType, filter?: any) => void` | Função de roteamento e aplicação de filtro contextual |

## Fluxo Principal de Renderização
1. O componente obtém os dados agregados do `AppContext` (`DashboardView.tsx:21-37`).
2. Localiza a etapa atual da obra (`etapas.find(e => e.id === activeObra.etapaAtualId)`), com fallback para a segunda etapa se não encontrada (`DashboardView.tsx:39`).
3. Calcula as porcentagens de custo por categoria (`pctMateriais`, `pctMaoDeObra`, `pctTrilhos`, `pctAbastecimentos`) com base no `totalGeralObra` (`DashboardView.tsx:41-44`).
4. Determina o percentual consumido do teto de mão de obra limitando o valor a 100% para evitar overflow da barra de progresso (`DashboardView.tsx:46-47`).
5. Ordena despesas e diárias descendentemente por data e fatia os primeiros 4 itens (`DashboardView.tsx:49-50`).
6. Renderiza os blocos visuais: Banner de Boas-vindas, Cards de KPIs, Painel de Mão de Obra, Distribuição de Custos, Ações Rápidas e Tabelas Recentes.

## Fluxos Alternativos e Interações
- **Clique em Ação Rápida:**
  - Usuário clica em um dos botões rápidos (ex.: Nova Despesa, Recibo, Produção). O sistema invoca `navigateToTabWithFilter('despesas')` alterando a aba ativa da aplicação.
- **Obra sem lançamentos (`totalGeralObra === 0`):**
  - Os cálculos percentuais evitam divisão por zero retornando `'0'` por padrão.

## Dependências
- `src/context/AppContext.tsx`: Provedor de dados globais e estado reativo.
- `src/utils/currency.ts`: Função `formatBRL` para exibição padronizada de valores monetários.
- `src/utils/date.ts`: Função `formatDateBR` para formatação de datas.
- `lucide-react`: Biblioteca de ícones (TrendingUp, Users2, Hammer, CreditCard, Receipt, Building, etc.).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Agregação pré-calculada no Contexto | KPIs como `totalGeralObra` e `totaisPorCategoria` são calculados no `AppContext` e não recalculados no render local | 🟢 |
| Fallback para teto de R$ 32.000,00 | `activeObra.tetoMaoDeObra || 32000` | 🟢 |
| Limitação visual a 100% no teto | `Math.min(100, (totalMaoDeObra / tetoMaoDeObra) * 100).toFixed(1)` | 🟢 |
| Design responsivo Mobile-First | Classes utilitárias Tailwind com padding inferior extra para acomodar bottom bar em mobile (`pb-20 lg:pb-8`) | 🟢 |

## Estado Interno
- O componente é essencialmente stateless localmente; todo o estado é derivado e sincronizado com o `AppContext`.

## Observabilidade
- Não há emissão de logs ou telemetria formal na camada cliente do componente 🟢.

## Riscos e Lacunas
- 🟡 Caso a lista de despesas ou diárias seja extremamente volumosa, o `sort()` executado inline a cada render de `DashboardView` pode incorrer em custo de CPU; recomendável memorização (`useMemo`).

