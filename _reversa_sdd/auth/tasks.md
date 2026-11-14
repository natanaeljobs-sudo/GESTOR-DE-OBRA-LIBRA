# Unit: Autenticação (auth), Tarefas de Implementação

> Sequência de tarefas executáveis para implementação ou migração do módulo de Autenticação.

## Pré-requisitos
- [x] Estrutura do `AppContext` com estado de `usuarioLogado` e lista de `usuarios`
- [x] Ícones do `lucide-react` instalados

## Tarefas

- [ ] T-01, Criar formulário de login com busca de usuário
  - Origem no legado: `src/components/auth/LoginView.tsx:32-46`
  - Critério de pronto: Usuário consegue digitar identificador e acionar a troca de usuário no contexto
  - Confiança: 🟢

- [ ] T-02, Implementar botões de acesso rápido
  - Origem no legado: `src/components/auth/LoginView.tsx:203-262`
  - Critério de pronto: Clicar em Master, Admin ou Operador faz login imediato com os perfis pré-definidos
  - Confiança: 🟢

- [ ] T-03, Implementar modal de solicitação de acesso
  - Origem no legado: `src/components/auth/LoginView.tsx:302-414`
  - Critério de pronto: Modal abre, valida campos não vazios, dispara `registrarSolicitacaoAcesso` e fecha após feedback
  - Confiança: 🟢

- [ ] T-04, Integrar botão de alternância de tema no card de login
  - Origem no legado: `src/components/auth/LoginView.tsx:88-102`
  - Critério de pronto: Clique alterna entre tema claro e escuro instantaneamente
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar login rápido com usuário Master
- [ ] TT-02, Testar fallback quando digitado um usuário inexistente
- [ ] TT-03, Testar validação e envio do formulário de solicitação de acesso

## Ordem Sugerida
1. T-01 e T-04 primeiro (garantir acesso básico à aplicação).
2. T-02 (facilita testes de desenvolvimento).
3. T-03 (fluxo secundário de solicitação).

## Lacunas Pendentes (🔴)
- Definir se na versão migrada haverá provedor de autenticação real (Supabase Auth, Firebase ou JWT backend).

