# Redesign do Histórico de Recibos (Padronização com Permissões e Solicitações)

Adequação visual exclusiva da seção **Histórico de Recibos Emitidos** dentro da aba de **Recibos**, substituindo a lista simples por uma tabela corporativa de dados com barra de pesquisa, filtros e botões de ação compactos idêntica ao padrão adotado nas abas de Permissões e Solicitações.

> [!IMPORTANT]
> **Escopo Estrito e Isolamento Total**: Conforme ordem expressa, **nenhuma outra aba ou página será alterada**. Dentro da aba Recibos, o gerador de recibo e a folha de pré-visualização oficial permanecem exatamente como estão. A alteração incidirá unicamente sobre o bloco demarcado de Histórico de Recibos Emitidos.

---

### Decisões Confirmadas na Fase 1

- **Estrutura de Colunas**: Tabela estruturada com `Recibo`, `Trabalhador`, `Período / Motivo`, `Valor Total` e `Ações`.
- **Barra de Pesquisa e Filtros**: Barra superior no estilo corporativo de Permissões, contendo campo de busca em tempo real (número do recibo, trabalhador ou motivo) e filtro por trabalhador/período com botão de limpeza rápida (`RotateCcw`).
- **Botões de Ação**: Botões compactos de ícone (`w-7 h-7 rounded-lg`) para Visualizar (`Eye`), Editar (`Pencil`) e Excluir (`Trash2`), harmonizando exatamente com a tabela de Permissões e Solicitações.

---

## 1. Visão Geral da Mudança

Transformar a apresentação inferior da aba de Recibos para oferecer a mesma consistência visual, densidade de informações e facilidade de localização de itens que o usuário já utiliza na aba de Permissões e Solicitações.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ABA RECIBOS (INALTERADO)                        │
│  [Dados do Recibo / Gerador]       [Pré-visualização Oficial Folha]    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│         NOVO DESIGN: HISTÓRICO DE RECIBOS (ESTILO PERMISSÕES)          │
│                                                                        │
│  ┌─ BARRA DE PESQUISA & FILTROS ─────────────────────────────────────┐  │
│  │ 🔍 [Buscar por recibo, beneficiário...]  [Trabalhador ▾]  [Limpar]│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─ TABELA CORPORATIVA (HEADER ZINC-50/70) ──────────────────────────┐  │
│  │ RECIBO     │ TRABALHADOR  │ PERÍODO / MOTIVO │ VALOR      │ AÇÕES │  │
│  ├────────────┼──────────────┼──────────────────┼────────────┼───────┤  │
│  │ REC-2026-01│ MANOEL SILVA │ 23/10 a 03/11    │ R$ 560,00  │ 👁️ ✏️ 🗑️│  │
│  └────────────┴──────────────┴──────────────────┴────────────┴───────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Experiência do Usuário & Design Visual

### Barra de Pesquisa e Filtros
- Container com cantos arredondados (`rounded-[18px]`), fundo branco / escuro no modo dark (`bg-white dark:bg-[#111c2d]`), borda sutil (`border-[#e6ecf1] dark:border-[#333f55]`) e padding equilibrado (`p-3 sm:p-4`).
- Campo de busca com ícone de lupa (`Search`) à esquerda e botão de limpar busca (`X`) quando houver texto preenchido.
- Seletor suspenso de filtro por trabalhador para filtrar instantaneamente os recibos de um profissional específico ou ver todos.
- Botão "Limpar" com ícone de rotação (`RotateCcw`) visível sempre que houver algum filtro ou termo de busca ativo.

### Tabela Corporativa
- Container com cantos `rounded-[20px]`, sombra suave e overflow controlado (`overflow-hidden`).
- Cabeçalho padronizado com `bg-zinc-50/70 dark:bg-[#162232]/50`, texto em caixa alta `text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider`.
- Linhas com efeito hover suave (`hover:bg-zinc-50/80 dark:hover:bg-[#162232]/60 transition-colors`) e altura padronizada.
- Célula de **Recibo**: Tag identificadora destacada com `#0085db`, data de emissão em formato brasileiro (`formatDateBR`).
- Célula de **Trabalhador**: Nome em caixa alta bold (`font-bold uppercase text-[#111c2d] dark:text-white`) acompanhado da função do profissional (ex: Pedreiro, Serviços Gerais).
- Célula de **Período**: Período de apuração (data inicial a data final) e prévia do motivo com tooltip explicativo.
- Célula de **Valor**: Numerais tabulares alinhados (`font-bold tabular-nums text-sm text-[#111c2d] dark:text-white`).
- Célula de **Ações**: Alinhada à direita com grupo inline de botões de ícone compactos (`w-7 h-7 rounded-lg`):
  - `Eye` (Visualizar no modelo oficial impresso à direita)
  - `Pencil` (Editar recibo no modal de edição completa)
  - `Trash2` (Excluir recibo com opção de estorno das diárias)
- Estado Vazio ("Empty State") elegante com mensagem orientativa quando não houver recibos ou nenhum resultado corresponder aos filtros.

---

## 3. Decisões Técnicas & Arquitetura

- **Arquivo Único Modificado**: `src/components/recibos/RecibosView.tsx`. Nenhuma outra página do sistema será tocada.
- **Estados Locais Adicionados**:
  - `searchTermHistory`: termo de busca na lista de recibos emitidos.
  - `filterTrabHistory`: filtro por trabalhador selecionado.
  - `filteredRecibos`: memoized list filtrando por identificação, beneficiário e motivo.
- **Preservação Total da Lógica de Negócio**: Os modais de edição (`handleOpenFullEdit`), confirmação de exclusão (`handleOpenDelete`) e carregamento na folha de impressão (`handleVisualizarRecibo`) continuam com todas as validações e sincronizações ativas com `AppContext`.

---

## 4. Plano de Implementação

1. **Adicionar estados de busca e filtro** no componente `RecibosView.tsx`.
2. **Substituir o bloco de renderização do histórico** (atualmente uma lista de `div`s separadas por linha) pela estrutura completa de Toolbar + Tabela Corporativa de dados no padrão de `Permissões`.
3. **Implementar os botões de ação compactos** com tooltips e transições suaves.
4. **Verificar a compilação e validação de lint** sem alterar nenhum outro arquivo da aplicação.
