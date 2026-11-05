# Redesign da Aba de Relatórios Financeiros no Design System

Reestruturação visual e funcional da tela **Relatórios Financeiros** (`RelatoriosView.tsx`) para reproduzir o layout executivo de referência da imagem enviada pelo usuário, integrando perfeitamente a paleta, tipografia e componentes do Design System Spike já existente no aplicativo, com suporte completo a tema escuro, filtros rápidos, paginação e folha executiva de impressão A4.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas com o usuário via entrevista:**
> - **Seleção de Período**: Menu seletor interativo com atalhos rápidos (*"Mês Atual"*, *"Obra Toda"*, *"Últimos 30 Dias"*) e intervalo de datas personalizadas (*Data Inicial* e *Data Final*).
> - **Abas de Categoria na Tabela**: Segmentação ativa por categoria real da obra (*"Todos"*, *"Materiais"*, *"Mão de obra"*, *"Trilhos"*, *"Abastecimentos"*), permitindo filtro instantâneo dos lançamentos.
> - **Impressão Executiva A4**: Folha de relatório formal formatada para papel A4 com cabeçalho corporativo da Libra Construtora e da Obra Juscelino Mola, dados do período, cards executivos de totais, gráfico proporcional e listagem detalhada.

---

### 1. Overview & Core Concept

- **O que faz**: Reformula a aba de Relatórios para a estrutura executiva moderna apresentada no layout de referência:
  1. **Cabeçalho Executivo**: Título em destaque, período dinâmico no subtítulo e ações rápidas no topo (*Exportar CSV* e *Imprimir*).
  2. **Barra de Filtros Contextuais**: Seletor de período com calendário popover e filtro de etapas da obra (*Todas as etapas*).
  3. **3 Cards de Destaque (KPIs)**: *Total Apurado* (em destaque no azul do design system `#0085db`), *Lançamentos* (contagem do período) e *Maior Categoria* (nome e percentual de participação).
  4. **Card de Resumo por Categoria**: Barra proporcional horizontal segmentada e lista de categorias com marcadores coloridos, valores consolidados e percentual.
  5. **Card de Lançamentos do Período**: Tabela paginada (10 itens por página) com abas segmentadas por categoria, badges coloridos suaves por tipo, descrição com fornecedor/trabalhador e valores alinhados à direita com números tabulares.
- **Público-Alvo**: Gestores, investidores e engenheiros da obra que necessitam de visão contábil limpa, prestação de contas executiva e exportação.
- **Valor Agregado**: Legibilidade financeira de alto nível, elimina visual de tabela bruta, adota o padrão estético Spike do restante do sistema e garante compatibilidade com impressão e mobile.

---

### 2. User Experience & Visual Design

#### Fluxo do Usuário
1. O usuário acessa a aba **Relatórios**.
2. No topo, confere o título **Relatórios financeiros** e o subtítulo dinâmico indicando o nome da obra ativa e as datas do filtro selecionado (ex: `Obra Juscelino Mola · 01/09/2026 a 04/11/2026`).
3. Dois botões no canto superior direito:
   - **Exportar CSV**: Baixa a planilha completa com todos os lançamentos do período selecionado.
   - **Imprimir**: Dispara a rotina de impressão formatada em A4.
4. **Filtros**:
   - Botão de calendário estilizado que exibe o intervalo atual e abre popover com presets rápidos (*"Este mês"*, *"Últimos 30 dias"*, *"Obra completa"*, *"Personalizado"*).
   - Dropdown de seleção de etapa da obra (*"Todas as etapas"* ou etapas específicas).
5. **Grid de 3 Cards de Métricas**:
   - *Total Apurado*: Valor em grande escala (`text-2xl` a `text-3xl font-extrabold text-[#0085db] tabular-nums`).
   - *Lançamentos*: Quantidade de transações filtradas.
   - *Maior Categoria*: Categoria dominante com respectiva fatia percentual.
6. **Card de Resumo por Categoria**:
   - Barra proporcional única com segmentos coloridos arredondados:
     - Azul (`#0085db`): Materiais da obra
     - Verde esmeralda (`#4bd08b`): Mão de obra
     - Roxo índigo (`#8763da`): Produção de trilhos
     - Ciano (`#46caeb`): Abastecimentos
   - Lista alinhada de cada categoria com marcador circular, valor em moeda e percentual formatado.
7. **Card de Lançamentos do Período**:
   - Barra de abas/filtros segmentados: `Todos` | `Materiais` | `Mão de obra` | `Trilhos` | `Abastec.`
   - Colunas da tabela:
     - **DATA**: `DD/MM` (ex: `04/09`) em fonte semiserifada limpa.
     - **TIPO**: Badges sutis e elegantes com fundo pastel/opaco e texto na cor da categoria.
     - **DESCRIÇÃO**: Título do lançamento em negrito (`text-xs font-bold`) e subtítulo informativo com fornecedor ou trabalhador.
     - **VALOR**: Valor em reais em negrito tabular à direita.
   - Rodapé com contagem: *"1–10 de X registros"* e paginação interativa (*[ < ] [ 1 ] [ 2 ] ... [ > ]*).

#### Tema e Design System (Spike Tailwind v4)
- Superfícies: cards brancos no modo claro (`bg-white border-[#e6ecf1] rounded-[18px] shadow-xs`), e azul escuro profundo no modo escuro (`dark:bg-[#111c2d] dark:border-[#333f55]`).
- Tipografia: `Plus Jakarta Sans` para títulos e textos, `tabular-nums` para todos os valores monetários e numéricos.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Unificação de Despesas e Diárias em um Ledger Único de Lançamentos**
  - *Abordagem*: Consolidar tanto as despesas de notas fiscais quanto as diárias de mão de obra em uma lista unificada ordenada por data decrescente, permitindo filtrar por abas de categoria.
  - *Motivo*: Espelha perfeitamente a experiência contábil demonstrada no mockup, onde materiais e mão de obra coexistem no mesmo período.
- **Decisão 2: Paginação no Cliente (10 registros por página)**
  - *Abordagem*: Criar paginação limpa no rodapé da tabela para manter a altura da tela equilibrada, com controles de página anterior, próxima e números diretos.
  - *Motivo*: Evita tabelas com scroll vertical infinito e mantém a densidade de layout elegante como na referência.
- **Decisão 3: Menu Popover para Seleção de Datas**
  - *Abordagem*: Substituir os inputs brutos de data por um gatilho de botão estilizado com ícone de calendário que abre um menu flutuante com atalhos rápidos e campos manuais de data.
  - *Motivo*: Limpa a barra superior e segue fielmente a interface minimalista do layout solicitado.
- **Decisão 4: Folha de Impressão A4 Otimizada**
  - *Abordagem*: Adicionar estilos de impressão (`@media print` ou classe `print:`) para que o botão "Imprimir" gere uma folha contábil limpa, sem elementos de navegação, com cabeçalho da construtora e resumo financeiro.
  - *Motivo*: Atende diretamente a escolha confirmada na entrevista com o usuário.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RelatoriosView.tsx                              │
├────────────────────────────────────────────────────────────────────────┤
│ Header: Título "Relatórios financeiros" | [Exportar CSV] [🖶 Imprimir]  │
│ Subtítulo dinâmico: "Obra Juscelino Mola · DD/MM/AAAA a DD/MM/AAAA"    │
├────────────────────────────────────────────────────────────────────────┤
│ Barra de Filtros: [📅 01/09/2026 – 04/11/2026 ▾]  [📑 Todas as etapas ▾]│
├────────────────────────────────────────────────────────────────────────┤
│ Grid 3 KPIs:                                                           │
│ ┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐ │
│ │ TOTAL APURADO        │ │ LANÇAMENTOS      │ │ MAIOR CATEGORIA      │ │
│ │ R$ 29.525,62         │ │ 59               │ │ Materiais · 66,6%    │ │
│ └──────────────────────┘ └──────────────────┘ └──────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ Card Resumo por Categoria:                                             │
│ - Barra de Proporção Horizontal Segmentada (Multi-color)               │
│ - Lista de Categorias: [●] Categoria  ----  R$ Valor  --  XX,X%       │
├────────────────────────────────────────────────────────────────────────┤
│ Card Lançamentos do Período:                                           │
│ - Abas de Filtro: [Todos] [Materiais] [Mão de obra] [Trilhos] [Abastec.]│
│ - Tabela de Lançamentos:                                               │
│   ┌──────┬────────────┬─────────────────────────────┬────────────────┐ │
│   │ DATA │ TIPO       │ DESCRIÇÃO                   │ VALOR          │ │
│   ├──────┼────────────┼─────────────────────────────┼────────────────┤ │
│   │ 04/09│ Materiais  │ Cimento e areia para sapata │ R$ 4.850,50    │ │
│   │      │            │ Comercial Silva Materiais   │                │ │
│   └──────┴────────────┴─────────────────────────────┴────────────────┘ │
│ - Rodapé de Paginação: "1–10 de 59 registros"   [<] [1] [2] [3] [>]   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Estado e Filtros**:
  - `dataInicio`, `dataFim`: Intervalo ativo de datas.
  - `selectedEtapa`: `'todas'` ou ID da etapa ativa.
  - `categoryFilter`: `'todas' | 'materiais' | 'mao_de_obra' | 'trilhos_producao' | 'abastecimentos'`.
  - `currentPage`: Página atual da tabela (inicia em 1).
  - `isDateMenuOpen`: Controle do popover de atalhos de data.
- **Estrutura dos Itens no Ledger**:
  - `id`: identificador único.
  - `data`: string no formato `YYYY-MM-DD`.
  - `tipo`: `'materiais' | 'mao_de_obra' | 'trilhos_producao' | 'abastecimentos'`.
  - `tipoLabel`: rótulo legível em português.
  - `descricao`: título principal do gasto ou diária.
  - `subtitulo`: fornecedor, observação ou nome do colaborador.
  - `valor`: número decimal com o valor em reais.
