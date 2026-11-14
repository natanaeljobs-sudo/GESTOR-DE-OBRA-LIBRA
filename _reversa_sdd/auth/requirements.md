# Unit: Autenticação (auth)

> Especificação de Requisitos do Módulo de Autenticação e Acesso.

## Visão Geral
Responsável pelo controle de entrada de usuários no sistema, alternância de tema na tela de login, solicitação de novos acessos e atalhos rápidos de login para testes/demonstração.

## Responsabilidades
- Autenticar usuários via credenciais simuladas/busca em memória ou atalhos diretos.
- Permitir ao usuário alternar tema visual (claro/escuro) diretamente na tela inicial.
- Coletar formulário de "Solicitar Acesso" e registrar intenção para o usuário Master.

## Regras de Negócio
- Identificação do usuário por e-mail, nome, ID ou termo especial "master" 🟢.
- Se o identificador digitado não for localizado, o sistema assume fallback para o primeiro perfil Master ou o primeiro usuário da lista (comportamento de demonstração) 🟢.
- Solicitação de acesso exige preenchimento obrigatório de Nome, E-mail e Mensagem 🟢.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Login com identificador flexível | Must | Localizar usuário por e-mail, nome ou ID e autenticar no `AppContext` |
| RF-02 | Atalhos de acesso rápido | Should | Botões de 1 clique para logar como Master, Admin ou Operador |
| RF-03 | Formulário de solicitação de acesso | Should | Modal com envio de solicitação salva na lista de notificações/solicitações do Master |
| RF-04 | Alternância de tema na tela | Could | Botão de alternar tema claro/escuro persistido no contexto |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Sem hash ou validação real de senha na camada cliente | `src/components/auth/LoginView.tsx:32-46` | 🟢 |
| Usabilidade | Feedback visual e fechamento automático do modal em 2.5s após solicitação | `src/components/auth/LoginView.tsx:57-64` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o usuário está na tela de login
Quando clica no botão "Acessar" do perfil Master
Então o sistema define o usuário Master no contexto e redireciona para a visão principal

Dado que o usuário preenche a solicitação de acesso com nome, e-mail e mensagem válidos
Quando submete o formulário
Então exibe tela de sucesso e grava o registro via registrarSolicitacaoAcesso
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Autenticação e seleção de usuário | Must | Ponto de entrada indispensável para carregar a aplicação |
| Solicitação de acesso | Should | Canal para novos colaboradores da obra |
| Acesso rápido em 1 clique | Could | Auxiliar de teste/desenvolvimento |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/components/auth/LoginView.tsx` | `LoginView` | 🟢 |
| `src/context/AppContext.tsx` | `login`, `registrarSolicitacaoAcesso` | 🟢 |

