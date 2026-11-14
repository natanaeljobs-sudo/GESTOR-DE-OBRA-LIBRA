# Unit: Autenticação (auth), Design Técnico

> Design e arquitetura técnica do módulo de Login e Acesso.

## Interface

### Componentes e Props
| Símbolo | Tipo | Entrada | Retorno | Observação |
|---------|------|---------|---------|------------|
| `LoginView` | React.FC | Nenhuma prop direta | `JSX.Element` | Consome `useApp()` do `AppContext` |

### Ações e Métodos de Contexto Consumidos
| Símbolo | Assinatura | Efeito |
|---------|-----------|--------|
| `login` | `(usuarioId: string) => void` | Define `usuarioLogado` no `AppContext` e transiciona o estado da aplicação |
| `toggleTheme` | `() => void` | Inverte tema entre `'light'` e `'dark'` |
| `registrarSolicitacaoAcesso` | `(dados: { nome: string; email: string; mensagem: string }) => void` | Adiciona item à lista de solicitações pendentes |

## Fluxo Principal
1. Usuário acessa a rota/visão inicial (se `!usuarioLogado`, `App.tsx` renderiza `LoginView`).
2. Usuário digita login/email ou clica no botão rápido (ex: "Master - Natanael Dias").
3. A função `handleSubmit` pesquisa o usuário na lista `usuarios`.
4. Se encontrado ou pelo fallback, executa `login(matchedUser.id)`.
5. `AppContext` atualiza `usuarioLogado` e `App.tsx` monta o shell da aplicação com `Sidebar` e `Header`.

## Fluxos Alternativos
- **Fallback de usuário:** Se nenhum match exato for encontrado na lista, é selecionado o primeiro perfil master ou o primeiro usuário cadastrado (`src/components/auth/LoginView.tsx:43-44`) 🟢.
- **Solicitação de Acesso:** Usuário abre o modal, insere nome, e-mail e justificativa. O estado local `reqSubmitted` vira `true`, exibe modal de confirmação e reseta os campos após 2500ms 🟢.

## Dependências
- `src/context/AppContext.tsx`: Gerenciamento central de usuários, autenticação e tema.
- `lucide-react`: Ícones de interface (`User`, `Lock`, `Eye`, `EyeOff`, `Sun`, `Moon`, `UserPlus`, etc.).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Autenticação sem backend/senha mockada | `src/components/auth/LoginView.tsx:32-46` | 🟢 |
| Layout responsivo com Hero Image em desktop | `src/components/auth/LoginView.tsx:77-83` | 🟢 |

## Estado Interno
- `email`: string (campo de usuário/e-mail)
- `password`: string (senha digitada)
- `showPassword`: boolean (visibilidade de senha)
- `rememberMe`: boolean (checkbox memorizar)
- `isRequestModalOpen`: boolean (controle de abertura de modal)
- `reqNome`, `reqEmail`, `reqMensagem`: strings (dados do formulário de acesso)
- `reqSubmitted`: boolean (feedback de envio concluído)

## Observabilidade
- Nenhuma ferramenta externa de telemetria ou log configurada 🟢.

## Riscos e Lacunas
- 🔴 Inexistência de validação criptográfica de credenciais; login funciona puramente por matching de ID/Nome.

