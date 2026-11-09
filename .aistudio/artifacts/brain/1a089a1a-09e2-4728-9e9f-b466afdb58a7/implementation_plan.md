# Paginação da Página de Diárias (Mão de Obra)

Implementação de paginação semana a semana na tela de Mão de Obra & Diárias com tabela unificada e rodapé de controle idêntico ao padrão da tela de Relatórios Financeiros, reduzindo a altura da página e mantendo todas as funcionalidades existentes de pagamento e exclusão.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisões alinhadas com o usuário via entrevista inicial:
> - **Granularidade da Paginação**: 1 semana por página (`Paginar cada semana individualmente`).
> - **Estrutura Visual**: Tabela unificada em container único com rodapé de paginação no padrão da tela de Relatórios, eliminando a rolagem vertical excessiva gerada pela repetição de vários cartões empilhados.

- **Seleção de Período Semanal**: Cada página corresponde a uma semana ativa do projeto (ordenadas da mais recente para a mais antiga).
- **Ações Preservadas**: Botão de lote "Pagar Semana" para trabalhadores com pendências na semana ativa, botões individuais de marcação de pagamento e modal de exclusão.
- **Filtros Preservados**: Filtro por trabalhador e abas de status ("Todos", "A Pagar", "Pagos") operam em sincronia com a paginação.

---

### 1. Overview & Core Concept

- **O que faz**: Transforma a visualização da tela de diárias — que atualmente empilhava múltiplos cartões de semanas completas numa página longa — em um painel unificado com paginação estilo relatório (`< 1 2 3 ... 6 >` e `Semana X de Y · [data início] a [data fim]`).
- **Público-alvo**: Gestor da obra e administradores financeiros acompanhando diárias semanais com agilidade.
- **Valor agregado**: Navegação direta entre semanas sem rolagem excessiva, alinhando a experiência com o grid de alta densidade da tela de relatórios.

---

### 2. User Experience & Visual Design

- **Hierarquia Visual**:
  1. **Cabeçalho de Página**: Título "Mão de Obra & Diárias", subtítulo descritivo e botões de ação ("Novo Trabalhador" e "Lançar Diária"). *Preservado intacto*.
  2. **Card de Teto Fechado (R$ 32.000,00)**: Resumo consolidado do teto, total pago, pendente e saldo disponível com barra de progresso proporcional. *Preservado intacto*.
  3. **Barra de Filtros & Ações**: Select de trabalhadores, segmented control ("Todos", "A Pagar", "Pagos") e botão para Gerador de Recibos. *Preservado intacto*.
  4. **Container da Tabela Unificada (Estilo Relatório)**:
     - Header da Semana com título da semana ativa (`Semana: 19/10/2026 a 25/10/2026`), contagem de diárias registradas, total financeiro da semana e botões de lote "Pagar Semana".
     - Tabela limpa com altura padronizada (`53px` por linha), alinhamentos tipográficos rigorosos e tabular figures (`tabular-nums`).
     - Rodapé com componente de paginação completo: contador textual (`Semana 1 de 6 · 12 registros nesta semana`), setas de navegação (`ChevronLeft` / `ChevronRight`) e botões numéricos com ellipsis inteligente (`1`, `2`, `3`, `...`, `6`).

- **Cores & Tokens (Design System)**:
  - Fundo do card: `bg-white dark:bg-[#111c2d]`
  - Borda: `border-[#e6ecf1] dark:border-[#333f55]`
  - Botão de página ativo: `bg-[#0085db]/15 text-[#0085db] border-[#0085db]/30 dark:bg-[#0085db]/30 dark:text-white`
  - Botões inativos: `border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#162232]`

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Paginação por Semanas em Tabela Unificada**
  - *Abordagem*: Cada página corresponde a uma semana de trabalho (`currentWeekIndex`), exibindo a tabela da respectiva semana com totalizador e lote de pagamento integrados.
  - *Motivo*: Respeita a lógica de negócio da construção civil (fechamento e quitação semanal de segunda a domingo) e atende exatamente à solicitação de ter a paginação idêntica ao relatório sem esticar a página.

- **Decisão 2: Preservação Estrita do Escopo**
  - *Abordagem*: Alterações restritas a `src/components/maodeobra/MaoDeObraView.tsx`.
  - *Motivo*: Cumprimento rigoroso das regras de escopo inegociáveis. Nenhuma outra tela ou componente externo será tocado.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│ MaoDeObraView.tsx                                                      │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Header (Título, "Novo Trabalhador", "Lançar Diária")                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Teto Fechado Tracker (R$ 32.000,00)                                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Barra de Filtros (Trabalhador, Status, Link Recibos)                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Container Unificado (Paginado)                                     │ │
│ │ ├─ Header da Semana Ativa + Total + Botões "Pagar Semana"          │ │
│ │ ├─ Tabela de Diárias (53px row-height, tabular-nums)               │ │
│ │ └─ Rodapé de Paginação (Estilo RelatóriosView)                     │ │
│ │    [ "Semana 1 de 6" ] ────────────── [ < ] [ 1 ] [ 2 ] ... [ > ]  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Arquivos Envolvidos
- **Modificado**: `src/components/maodeobra/MaoDeObraView.tsx`
- **Não alterados**: Todas as outras telas, componentes globais, contextos e dados.
