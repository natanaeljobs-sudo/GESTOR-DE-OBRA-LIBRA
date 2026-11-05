# Gerenciamento Completo de Unidades e Categorias de Materiais

Implementação de recurso completo para cadastrar, editar e excluir Unidades de Medida e Categorias no módulo de Materiais, acessível diretamente por botões rápidos de gerenciamento e pelas opções dos campos de seleção, com sincronização automática dos materiais já cadastrados.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões de usabilidade e comportamento foram confirmadas pelo usuário na etapa de esclarecimento:
> - **Acesso Rápido**: Botão de gerenciamento posicionado diretamente ao lado dos campos de seleção nos modais de cadastro e edição de materiais, além de atalho dentro da própria lista suspensa.
> - **Sincronização em Cascata**: Ao editar o nome de uma unidade ou categoria, todos os materiais vinculados são atualizados automaticamente no sistema.
> - **Exclusão com Proteção**: Usuários podem excluir unidades e categorias personalizadas, com confirmação e alerta visual sobre itens em uso.

- **Decisão Confirmada 1**: Modais dedicados de gerenciamento rápido para Unidades e Categorias, permitindo cadastro, renomeação e exclusão sem sair do fluxo de trabalho.
- **Decisão Confirmada 2**: Propagação automática de alterações em lote para materiais e despesas vinculadas.
- **Decisão Confirmada 3**: Persistência no armazenamento local (`AppContext` e `localStorage`), garantindo que novas unidades e categorias permaneçam disponíveis em todas as telas, filtros e relatórios.

---

## 1. Overview & Core Concept

- **O que faz**: Permite que os gestores de obra e compradores cadastrem novos tipos de unidades (ex.: saco, m², barra 12m, caixa, pallet, kg) e categorias construtivas (ex.: Alvenaria, Hidráulico, Pintura, Cobertura, Ferramentas), editem nomes já existentes com atualização automática dos materiais vinculados, e excluam itens em desuso.
- **Público-Alvo**: Engenheiros, mestres de obras, orçamentistas e administradores do sistema da Libra Construtora.
- **Valor Principal**: Flexibilidade operacional imediata no canteiro de obras, eliminando a restrição de listas estáticas pré-fixadas e evitando duplicidade ou inconsistência cadastral.

---

## 2. User Experience & Visual Design

### Fluxo de Usuário

1. **Abertura do Modal de Material (Novo ou Edição)**:
   - Ao abrir "Novo material" ou "Editar material", os campos "Unidade padrão *" e "Categoria" contam com botões elegantes no cabeçalho de cada campo: `Gerenciar unidades` e `Gerenciar categorias` (com ícones da biblioteca Lucide `Settings2` / `Pencil`).
   - Dentro da lista de opções do `<select>`, a última opção também exibe `⚙️ Cadastrar ou editar...`.

2. **Modal de Gerenciamento de Unidades**:
   - Título: *"Gerenciar Unidades de Medida"*.
   - Subtítulo: *"Cadastre novas unidades, altere nomenclaturas existentes ou remova opções."*
   - Campo superior para adição rápida: input de texto + botão `Adicionar Unidade` (`bg-[#0085db]`).
   - Lista organizada em linhas limpas:
     - Nome da unidade (ex.: `saco`, `m²`, `kg`).
     - Contador sutil de materiais vinculados (ex.: `4 materiais vinculados`).
     - Botão de edição inline (permite renomear diretamente na linha com `Salvar` ou `Cancelar`).
     - Botão de exclusão com confirmação e aviso se houver materiais vinculados.
   - Ao salvar ou adicionar uma unidade, o dropdown do formulário pai é automaticamente atualizado e seleciona a unidade recém-adicionada/modificada.

3. **Modal de Gerenciamento de Categorias**:
   - Título: *"Gerenciar Categorias de Materiais"*.
   - Subtítulo: *"Organize as fases construtivas e classificações dos materiais da obra."*
   - Campo para cadastro imediato de nova categoria com botão estilizado.
   - Tabela/lista com edição inline, contador de vínculos de materiais e opção de exclusão.
   - Sincronização em tempo real com o formulário principal.

### Identidade Visual & Diretrizes de Design

- **Padrão Spike / Libra Construtora**:
  - Paleta base: Azul institucional `#0085db` (hover `#0071ba`), fundos `#ffffff` (light) e `#111c2d` / `#162232` (dark), bordas sutis `#e6ecf1` / `#333f55`.
  - Tipografia: Títulos nítidos em `Plus Jakarta Sans`, numerais tabulares `tabular-nums` para contadores de itens vinculados.
  - Alinhamento aos princípios Anti-Slop: Sem pílulas coloridas estáticas, sem gradientes roxos, sem elementos mortos. Todos os botões possuem microinterações e transições `duration-150`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Armazenamento Centralizado no AppContext**:
  - *Abordagem*: Gerenciar `unidadesMedida` e `categoriasMateriais` no estado global do `AppContext`, sincronizando automaticamente com `localStorage`.
  - *Motivo*: Permite que os filtros da tela de materiais, os lançamentos de despesas e cotações de orçamentos se beneficiem das mesmas unidades e categorias cadastradas.
  - *Alternativa descartada*: Manter estado apenas local no componente `MateriaisView` (isso faria com que outros componentes não reconhecessem novas categorias).

- **Decisão 2: Atualização em Cascata nos Materiais Existentes**:
  - *Abordagem*: Quando o usuário renomear uma categoria (ex: de "Alvenaria" para "Alvenaria e Vedação"), o método do contexto varre os materiais e substitui a ocorrência antiga pela nova.
  - *Motivo*: Evita orfandade de dados e listas desordenadas nos relatórios e filtros.

- **Decisão 3: Modal de Gerenciamento vs. Inputs Descartáveis**:
  - *Abordagem*: Substituir o antigo campo temporário "custom" por um gerenciador completo modal que permite editar e excluir além de criar.
  - *Motivo*: Atende diretamente ao pedido do usuário ("Tem que ter a opção de cadastrar e editar") e à escolha confirmada na etapa de perguntas.

---

## 4. Technical Architecture & Data Strategy

### Component Hierarchy & Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         AppContext                          │
│  - unidadesMedida: string[]                                 │
│  - categoriasMateriais: string[]                            │
│  - addUnidadeMedida(nome)                                   │
│  - updateUnidadeMedida(oldName, newName) [atualiza materiais]│
│  - deleteUnidadeMedida(nome)                                │
│  - addCategoriaMaterial(nome)                               │
│  - updateCategoriaMaterial(oldName, newName) [atualiza mat.]│
│  - deleteCategoriaMaterial(nome)                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐       ┌───────────────────────┐
│        MateriaisView        │       │  Filtros de Pesquisa  │
│  - Tabela de Materiais      │       │  - Unidade Filter     │
│  - Indicadores e Histórico  │       │  - Status Filter      │
└──────────────┬──────────────┘       └───────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌─────────────────┐ ┌───────────────────────────┐
│ Modal: Novo     │ │ Modal: Editar Material    │
│ Material        │ │  - Dropdown Unidades      │
│  - [Gerenciar]  │ │  - [Gerenciar]            │
│  - Dropdown     │ │  - Dropdown Categorias    │
│  - [Gerenciar]  │ │  - [Gerenciar]            │
└────────┬────────┘ └─────────────┬─────────────┘
         │                        │
         └───────────┬────────────┘
                     │ Abre modais dedicados
                     ▼
       ┌─────────────────────────────────────┐
       │ Modais de Gerenciamento Especializado│
       │  ├─ GerenciarUnidadesModal          │
       │  │   - Adição de nova unidade       │
       │  │   - Edição inline de nome        │
       │  │   - Exclusão com verificação     │
       │  └─ GerenciarCategoriasModal        │
       │      - Adição de nova categoria     │
       │      - Edição inline de nome        │
       │      - Exclusão com verificação     │
       └─────────────────────────────────────┘
```

### Arquivos Envolvidos

1. `src/types/index.ts`:
   - Adicionar assinaturas das novas funções e coleções no contrato do `AppContextType`.
2. `src/context/AppContext.tsx`:
   - Inicializar e persistir `unidadesMedida` e `categoriasMateriais` com valores padrão da construção civil.
   - Implementar `addUnidadeMedida`, `updateUnidadeMedida` (com cascata nos materiais), `deleteUnidadeMedida`.
   - Implementar `addCategoriaMaterial`, `updateCategoriaMaterial` (com cascata nos materiais), `deleteCategoriaMaterial`.
3. `src/components/materiais/MateriaisView.tsx`:
   - Inserir botões de ação rápida `Gerenciar unidades` e `Gerenciar categorias` ao lado dos selects nos modais de criação e edição.
   - Adicionar opção `⚙️ Cadastrar e editar...` dentro dos `<select>`.
   - Adicionar os componentes de modal para gestão de unidades e categorias com formulário de adição rápida, listagem com contagem de uso e edição inline.
   - Vincular o filtro superior de unidades com o estado dinâmico `unidadesMedida`.
