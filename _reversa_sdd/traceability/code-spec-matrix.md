# Matriz de Rastreabilidade Código ↔ Especificação (Code-Spec Matrix)

> Rastreabilidade entre os arquivos do código-fonte legado e as unidades de especificação SDD em `_reversa_sdd/`.
> Documento gerado pelo **Reversa Writer**.

---

## 1. Mapeamento por Módulo

| Arquivo do Legado | Unidade SDD Correspondente | Cobertura | Status |
|---|---|---|---|
| `src/components/auth/LoginView.tsx` | `_reversa_sdd/auth/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/dashboard/DashboardView.tsx` | `_reversa_sdd/dashboard/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/alertas/AlertasView.tsx` | `_reversa_sdd/alertas/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/cartoes/CartoesView.tsx` | `_reversa_sdd/cartoes/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/despesas/DespesasView.tsx` | `_reversa_sdd/despesas/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/despesas/DespesaFormModal.tsx` | `_reversa_sdd/despesas/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/maodeobra/MaoDeObraView.tsx` | `_reversa_sdd/maodeobra/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/materiais/MateriaisView.tsx` | `_reversa_sdd/materiais/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/orcamentos/OrcamentosView.tsx` | `_reversa_sdd/orcamentos/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/producao/ProducaoView.tsx` | `_reversa_sdd/producao/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/recibos/RecibosView.tsx` | `_reversa_sdd/recibos/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/recibos/ReciboPreviewModal.tsx` | `_reversa_sdd/recibos/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/utils/reciboPrintService.ts` | `_reversa_sdd/recibos/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/relatorios/RelatoriosView.tsx` | `_reversa_sdd/relatorios/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/relatorios/RelatorioObraImpresso.tsx` | `_reversa_sdd/relatorios/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/relatorios/RelatorioPreviewModal.tsx` | `_reversa_sdd/relatorios/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/utils/relatorioPrintService.ts` | `_reversa_sdd/relatorios/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/components/usuarios/UsuariosView.tsx` | `_reversa_sdd/usuarios/` | 🟢 Completa | Requisitos, Design e Tarefas documentados |
| `src/context/AppContext.tsx` | `_reversa_sdd/architecture.md`, SDD de todos os módulos | 🟢 Completa | Estado global mapeado em todas as units |
| `src/types/index.ts` | `_reversa_sdd/data-dictionary.md`, SDD de todos os módulos | 🟢 Completa | Tipagem TypeScript coberta nos designs |

---

## 2. Estatísticas de Cobertura

- **Total de unidades canônicas:** 12 módulos
- **Cobertura de arquivos de componentes principais:** 100% (todos mapeados para suas respectivas units)
- **Cobertura de serviços de impressão/relatórios:** 100% (reciboPrintService e relatorioPrintService mapeados)

