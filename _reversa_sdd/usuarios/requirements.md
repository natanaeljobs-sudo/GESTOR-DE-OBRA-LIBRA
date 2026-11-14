# Requisitos — Módulo `usuarios`

> Especificação de requisitos do módulo de controle de acesso, perfis hierárquicos, permissões granulares por módulo, gestão de obras e triagem de solicitações.
> Documento gerado automaticamente pelo **Reversa Writer**.

---

## 1. Visão Geral

- **Módulo:** `usuarios`
- **Caminho no Legado:** `src/components/usuarios/UsuariosView.tsx`, `src/types/index.ts`, `src/context/AppContext.tsx`
- **Propósito:** Gestão corporativa de segurança (RBAC), controle fino de permissões em matriz CRUD por módulo, cadastro e ciclo de vida de obras com cronograma de 11 etapas, e triagem de solicitações de acesso público.
- **Nível de Confiança Geral:** 🟢 CONFIRMADO (código-fonte React/TypeScript analisado diretamente).

---

## 2. Requisitos Funcionais (RF)

| ID | Descrição | Prioridade (MoSCoW) | Confiança | Rastreabilidade no Código |
|---|---|---|---|---|
| **RF-01** | Controle de perfis hierárquicos: `master` (acesso total/irrestrito), `admin` (gestão operacional) e `operador` (execução com permissões restritas) | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:371-438, 620-658` |
| **RF-02** | Matriz de permissões granulares por módulo (`visualizar`, `criar`, `editar`, `excluir`) para 10 módulos do sistema | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:240-251, 316-402` |
| **RF-03** | Ações em massa na matriz de permissões: marcar tudo, somente leitura, padrão por perfil e desmarcar tudo | **Should** | 🟢 CONFIRMADO | `UsuariosView.tsx:353-401` |
| **RF-04** | Gestão de Usuários: criação, edição, ativação/desativação e exclusão lógica/física com filtros por nome, perfil e status | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:254-269, 451-509` |
| **RF-05** | Gestão de Obras: cadastro, edição e exclusão de obras com nome, endereço, orçamento total, teto de mão de obra e valor de venda | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:511-595` |
| **RF-06** | Cronograma de 11 Etapas da Obra (`Sapata`, `Alvenaria`, `Laje`, `Hidráulico`, `Elétrico`, `Reboco`, `Piso`, `Cerâmica`, `Gesso`, `Pintura`, `Acabamento`) | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:33-45, 116-132` |
| **RF-07** | Triagem de solicitações de acesso: aprovação rápida (gerando cadastro de operador), recusa e exclusão de solicitações | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:286-307, 498-500` |
| **RF-08** | Configuração do e-mail institucional Master de recebimento de notificações e pedidos de acesso | **Should** | 🟢 CONFIRMADO | `UsuariosView.tsx:86-90, 597-606` |
| **RF-09** | Bloqueio de acesso à tela de Permissões/Obras para perfis não-Master com opção de troca rápida de usuário ativo | **Must** | 🟢 CONFIRMADO | `UsuariosView.tsx:620-658` |

---

## 3. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição | Confiança | Evidência |
|---|---|---|---|---|
| **RNF-01** | **Segurança / Autorização** | Validação em tempo de execução: nenhum usuário sem perfil `master` pode visualizar ou alterar permissões, usuários ou configurações críticas | 🟢 CONFIRMADO | `if (activeUser.perfil !== 'master') return <AcessoRestrito />` |
| **RNF-02** | **Integridade de Estados** | Transições de status de obra para `concluida` devem sincronizar automaticamente a etapa atual para `Concluído` | 🟢 CONFIRMADO | `UsuariosView.tsx:539-547` |
| **RNF-03** | **Coerência Financeira** | Campos de orçamento total e teto de mão de obra devem possuir máscara de digitação em moeda brasileira (BRL) e conversão segura para float | 🟢 CONFIRMADO | `handleCurrencyInputChange`, `parseMoney` |

---

## 4. Critérios de Aceitação (Gherkin)

### Cenário 1: Aprovação de solicitação de acesso
- **Dado** que há uma solicitação de acesso pendente para "joao@email.com"
- **Quando** o Master clica em "Aprovar" na aba de Solicitações
- **Então** o formulário de cadastro abre preenchido com nome e e-mail como `operador`, e ao salvar, a solicitação passa para o status `aprovado`.

### Cenário 2: Configuração de matriz de permissões
- **Dado** um usuário com perfil `operador`
- **Quando** o Master abre o modal de permissões e clica em "Somente Leitura"
- **Então** todas as ações `criar`, `editar` e `excluir` são desmarcadas, mantendo apenas `visualizar` ativo em todos os 10 módulos.

