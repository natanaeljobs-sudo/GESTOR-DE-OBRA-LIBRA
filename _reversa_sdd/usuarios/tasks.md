# Tarefas de Reconstrução — Módulo `usuarios`

> Tarefas executáveis para implementação do módulo `usuarios` a partir das especificações reversas.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## Fila de Implementação

- [ ] **TASK-USR-01** — **Guarda de Segurança e Troca Rápida de Perfil Master** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/usuarios/UsuariosView.tsx:620-658`
  - **Descrição:** Implementar barreira de proteção de rota/componente que exibe tela de "Acesso Restrito" se `activeUser.perfil !== 'master'`, com opção de alternar para o usuário Master.
  - **Critério de Pronto:** Tentativa de acesso como operador/admin renderiza bloqueio com explicações e ação de switch de usuário.

- [ ] **TASK-USR-02** — **Sub-aba de Usuários e Modal da Matriz de Permissões** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/usuarios/UsuariosView.tsx:310-450, 709-800`
  - **Descrição:** Construir tabela de listagem de usuários com filtros (termo, perfil, status) e modal de edição de matriz granular CRUD para os 10 módulos com botões de ação em massa (Tudo, Somente Leitura, Padrão, Nenhum).
  - **Critério de Pronto:** Salvar no modal atualiza o array `usuarios` refletindo imediatamente as novas permissões do usuário editado.

- [ ] **TASK-USR-03** — **Sub-aba de Obras e Gestão do Cronograma de 11 Etapas** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/usuarios/UsuariosView.tsx:33-45, 116-133, 511-595`
  - **Descrição:** Desenvolver painel de obras cadastradas, formulário com máscaras de moeda (Orçamento Total, Teto Mão de Obra, Valor de Venda) e controle de status sincronizado com as 11 etapas do cronograma construtivo.
  - **Critério de Pronto:** Cadastro e edição de obra refletem no seletor global de obras e respeitam transição para "Concluído".

- [ ] **TASK-USR-04** — **Sub-aba de Solicitações de Acesso e Fluxo de Aprovação** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/usuarios/UsuariosView.tsx:271-307, 498-508`
  - **Descrição:** Construir listagem de solicitações com status (`pendente`, `aprovado`, `recusado`), botão de aprovação que transfere dados para novo operador e exclusão de solicitações.
  - **Critério de Pronto:** Aprovar solicitação abre modal de usuário com nome/email pré-preenchidos e atualiza status para `aprovado`.

- [ ] **TASK-USR-05** — **Configurações Gerais e E-mail Master** 🟢 CONFIRMADO
  - **Arquivo Legado de Origem:** `src/components/usuarios/UsuariosView.tsx:86-90, 597-606`
  - **Descrição:** Implementar formulário para definir o e-mail central do Master que recebe notificações do sistema.
  - **Critério de Pronto:** Persistência do `masterEmail` com validação de formato e toast de confirmação.

