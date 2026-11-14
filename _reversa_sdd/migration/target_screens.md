---
schemaVersion: 1
generatedAt: 2026-11-13T19:24:00-03:00
reversa:
  version: "1.3.6"
kind: target_screens
producedBy: screen-translator
mode: modernized
sourcePlatform: react-spa-tailwind
targetPlatform: web-spa-react19
adapter: adapters/react__modern-react
screenCount: 12
hash: "sha256:target-screens-libra-obras"
---

# Target Screens — SISTEMA LIBRA - OBRAS

> Especificação executável de cada tela do sistema novo, derivada do legado conforme o Modo Modernizado aprovado em `screen_modernization_decision.md`.
> Preserva labels, componentes e fluxos originais, introduzindo feedback de estado assíncrono (Idle, Loading, Error, Success).

## Resumo

- **Modo aplicado**: Modernizado
- **Telas geradas**: 12 telas/views
- **Adapter**: `adapters/react__modern-react`
- **Tokens consumidos**: `_reversa_sdd/design-system/tokens-derived.md`
- **Golden files manifest**: `_reversa_sdd/screens/golden/manifest.yaml`
- **Deviations**: Mapeadas em `screen_deviation_log.md` (DEV-001, DEV-002)

---

## 1. Tela: LoginModal (`auth`)
- **Origem**: `src/components/auth/LoginView.tsx`
- **Modo aplicado**: Modernizado
- **Componentes do design-system**: `color.brand.primary`, `radius.lg`, `typography.h2`
- **Transições de saída**: `/` (Dashboard após autenticação bem-sucedida)
- **Tela crítica?**: Sim

### Especificação
```yaml
spec.kind: component-tree
spec.states: [idle, loading, error, success]
spec.root:
  component: Modal
  children:
    - component: Header
      content: { title: "Acesso ao Sistema", subtitle: "Libra Obras" }
    - component: Form
      fields:
        - name: email
          type: email
          label: "E-mail"
          required: true
        - name: password
          type: password
          label: "Senha"
          required: true
      actions:
        - name: submit
          label: "Entrar"
          variant: primary
```
### Estados
| Estado | Descrição | Conteúdo / feedback |
|---|---|---|
| Idle | Formulário pronto | Botão habilitado "Entrar" |
| Loading | Autenticação no Supabase | Spinner no botão, campos desabilitados |
| Error | Falha de credenciais | Alerta vermelho: "E-mail ou senha inválidos" |
| Success | Token emitido | Redireciona para o Dashboard |

---

## 2. Tela: DashboardView (`dashboard`)
- **Origem**: `src/components/dashboard/DashboardView.tsx`
- **Modo aplicado**: Modernizado
- **Componentes do design-system**: `shadow.card`, `radius.md`, Grid 4 colunas
- **Transições de saída**: Navegação para Despesas, Cartões, Produção, etc.

### Especificação
```yaml
spec.kind: route-component
spec.route: /
spec.states: [idle, loading, error, success]
spec.component:
  component: DashboardView
  children:
    - component: KPIGrid
      cards:
        - label: "Total Despesas"
          icon: DollarSign
        - label: "Orçamento Total"
          icon: PieChart
        - label: "Mão de Obra Ativa"
          icon: Users
        - label: "Alertas Pendentes"
          icon: AlertTriangle
    - component: RecentExpensesTable
    - component: ProductionSummaryChart
```

---

## 3. Tela: DespesasView (`despesas`)
- **Origem**: `src/components/despesas/DespesasView.tsx`
- **Modo aplicado**: Modernizado
- **Transições de saída**: Detalhes, Criação/Edição via Modal

### Especificação
```yaml
spec.kind: route-component
spec.route: /despesas
spec.states: [idle, loading, error, success]
spec.component:
  component: DespesasView
  children:
    - component: FilterBar
      filters: [obraId, categoria, dataInicio, dataFim, statusPagamento]
    - component: ExpenseFormModal
    - component: ExpenseTable
      columns: [Data, Descrição, Categoria, Obra, Valor, Status, Ações]
```

---

## 4. Tela: CartoesView (`cartoes`)
- **Origem**: `src/components/cartoes/CartoesView.tsx`
- **Modo aplicado**: Modernizado
- **Transições de saída**: Gestão de faturas e lançamentos de cartão corporativo

---

## 5. Tela: MaoDeObraView (`maodeobra`)
- **Origem**: `src/components/maodeobra/MaoDeObraView.tsx`
- **Modo aplicado**: Modernizado
- **Transições de saída**: Cadastro de equipes, apontamento de diárias

---

## 6. Tela: RecibosView (`recibos`)
- **Origem**: `src/components/recibos/RecibosView.tsx` e `ReciboPreviewModal.tsx`
- **Modo aplicado**: Modernizado (com layout de impressão A4 estrito)
- **Desvio**: DEV-002 (CSS `@media print` A4 pixel-perfect)

### Especificação
```yaml
spec.kind: printable-view
spec.route: /recibos
spec.states: [idle, loading, error, success]
spec.print_format: A4
spec.components:
  - component: ReciboList
  - component: ReciboPreviewModal
    print_stylesheet: "recibo-print.css"
```

---

## 7. Tela: MateriaisView (`materiais`)
- **Origem**: `src/components/materiais/MateriaisView.tsx`
- **Modo aplicado**: Modernizado

---

## 8. Tela: OrcamentosView (`orcamentos`)
- **Origem**: `src/components/orcamentos/OrcamentosView.tsx`
- **Modo aplicado**: Modernizado

---

## 9. Tela: ProducaoView (`producao`)
- **Origem**: `src/components/producao/ProducaoView.tsx`
- **Modo aplicado**: Modernizado

---

## 10. Tela: AlertasView (`alertas`)
- **Origem**: `src/components/alertas/AlertasView.tsx`
- **Modo aplicado**: Modernizado

---

## 11. Tela: RelatoriosView (`relatorios`)
- **Origem**: `src/components/relatorios/RelatoriosView.tsx` e `RelatorioObraImpresso.tsx`
- **Modo aplicado**: Modernizado (com suporte à exportação e impressão)

---

## 12. Tela: UsuariosView (`usuarios`)
- **Origem**: `src/components/usuarios/UsuariosView.tsx`
- **Modo aplicado**: Modernizado
- **Acesso**: Restrito a administradores

