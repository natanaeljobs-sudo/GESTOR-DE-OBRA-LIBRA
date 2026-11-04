# Plano de Implementação: Redesign da Central de Permissões & Modal com Matriz de Checkboxes

Redesenho completo da interface da **Central de Permissões** no componente `UsuariosView.tsx` para seguir o layout de tabela da referência (`image_551c4a2e.png`), com visual corporativo moderno, preservando o design system existente e adicionando um modal popup com matriz de permissões (Ver, Criar, Editar e Excluir) por módulo ao clicar no botão de editar.

---

## 1. Visão Geral da Mudança

Atualmente, as permissões são exibidas diretamente em cards divididos em grade (2 colunas) com botões pequenos de ação inline. O objetivo é:
1. **Estrutura de Tabela Limpa (conforme a imagem de referência)**:
   - Título e subtítulo da seção: *"Usuários & Permissões - Gerencie contas de usuários, papéis e permissões de acesso ao sistema."* com botão `+ Novo Usuário` no topo direito.
   - Barra de filtros: busca por nome/e-mail, filtro por Perfil/Função, filtro por Status (Ativo/Inativo) e botão de limpar filtros.
   - Tabela com colunas: **Usuário** (avatar circular + nome + e-mail), **Função / Papel** (badge de perfil estilizado), **Status** (badge Ativo / Inativo), **Data Cadastro / Acesso** e **Ações** (Editar permissões, Ativar/Inativar, Excluir, Alternar visualização).
2. **Abas Superiores Preservadas Discretamente**:
   - Manter as abas no topo: `Central de Permissões`, `Gestão de Obras` e `Configurações do Master & Solicitações` com contadores discretos.
3. **Modal Popup de Permissões (ao clicar no lápis / editar)**:
   - Abre um modal elegante focado no usuário selecionado.
   - Barra de ações rápidas: *"Marcar Todos"*, *"Apenas Visualização"*, *"Padrão do Perfil"*.
   - **Matriz de Checkboxes por Módulo**:
     - 10 módulos do sistema: Dashboard, Despesas & Notas, Catálogo de Materiais, Mão de Obra & Diárias, Gerador de Recibos, Orçamentos & Cotações, Produção de Trilhos, Cartões & Faturas, Usuários & Permissões, Relatórios.
     - 4 colunas de permissão com checkboxes clicáveis: **Visualizar**, **Criar**, **Editar**, **Excluir**.
   - Botões de confirmação: *"Cancelar"* e *"Salvar Alterações"*.

---

## 2. Análise de Arquivos e Alterações

### A. `src/types/index.ts`
- Adicionar o campo opcional `dataCadastro?: string;` na interface `Usuario` para exibir a data de entrada/cadastro na tabela (conforme coluna *"Joined"* da referência).

### B. `src/context/AppContext.tsx`
- Adicionar função `deleteUsuario(id: string)` ao contexto para possibilitar exclusão de usuários não-master (com proteção para nunca excluir os administradores master Natanael e Ives).
- Garantir que `updateUsuario` persista adequadamente as alterações salvas pelo modal.

### C. `src/data/initialData.ts`
- Incluir `dataCadastro` nos usuários iniciais para enriquecer a visualização da tabela (ex: `"02/12/2025"`, `"01/12/2025"`).

### D. `src/components/usuarios/UsuariosView.tsx`
- **Estados Locais**:
  - `searchTerm`: filtro de busca em tempo real (nome e e-mail).
  - `perfilFilter`: filtro por perfil (`todos`, `admin_master`, `administrador`, `mestre_obra`, `socio_investidor`).
  - `statusFilter`: filtro por status (`todos`, `ativo`, `inativo`).
  - `editingUser`: usuário atualmente selecionado para edição de permissões no modal.
  - `tempPermissoes`: cópia de trabalho das permissões no modal para permitir cancelamento ou confirmação.
- **Tabela de Usuários**:
  - Implementar tabela moderna compatível com tema claro e escuro (`bg-white dark:bg-[#111c2d]`, bordas `border-[#e6ecf1] dark:border-[#333f55]`).
  - Ícone de lápis (`Edit3`) para abrir o modal de permissões.
  - Ícone de alternância de status (`Ban` / `CheckCircle2`) para ativar ou desativar o usuário.
  - Ícone de lixeira (`Trash2`) para exclusão de contas secundárias com confirmação.
  - Ação rápida para testar o perfil ("Assumir perfil") mantida de forma elegante.
- **Modal de Matriz de Permissões**:
  - Matriz com cabeçalho: `Módulo | Visualizar | Criar | Editar | Excluir`.
  - Checkboxes bem espaçados, com estados visuais claros (marcado/desmarcado) e atalhos rápidos no topo.
  - Proteção especial se o usuário selecionado for `admin_master`: exibe aviso explicativo informando que administradores master possuem acesso irrestrito total.

---

## 3. Plano de Verificação

### Testes Automatizados
- Executar `compile_applet` para assegurar que os tipos TypeScript e componentes compilam sem erros.
- Executar `lint_applet` para garantir conformidade estrita de sintaxe e imports.

### Testes Manuais & Visuais
1. **Layout e Responsividade**:
   - Verificar renderização no desktop e em dispositivos móveis/tablets (scroll horizontal suave para tabelas menores).
   - Verificar alternância entre modo claro e modo escuro.
2. **Filtros e Busca**:
   - Digitar nome no campo de busca e verificar se a tabela filtra instantaneamente.
   - Filtrar por perfil e status e testar botão de limpar filtros.
3. **Modal de Permissões**:
   - Clicar no botão de editar (lápis) de um usuário não-master (ex: Alberto).
   - Alterar checkboxes de `Visualizar`, `Criar`, `Editar`, `Excluir` em múltiplos módulos.
   - Testar atalhos: *"Marcar Todos"*, *"Apenas Visualização"*, *"Padrão do Perfil"*.
   - Clicar em *"Salvar Alterações"* e confirmar que os dados foram atualizados no estado global.
4. **Preservação de Recursos**:
   - Verificar se as abas *"Gestão de Obras"* e *"Configurações do Master & Solicitações"* continuam funcionando perfeitamente.
