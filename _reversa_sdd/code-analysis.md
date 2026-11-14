# Análise Técnica Consolidada — SISTEMA LIBRA - OBRAS

> Gerado pelo **Archaeologist** em 2026-11-13

## Arquitetura de Estado Atual

- **Gerenciamento de Estado:** Centralizado em `src/context/AppContext.tsx` (1.178 linhas) via React Context API (`useApp()`). 🟢 CONFIRMADO
- **Persistência:** Em memória com dados iniciais de `src/data/initialData.ts` (sem backend/Supabase conectado ainda). 🟢 CONFIRMADO
- **Navegação:** Baseada em estado `activeTab` (`TabType`) no `AppContext`, sem roteador URL (`react-router`). 🟢 CONFIRMADO

## Módulos Analisados

| Módulo | Arquivo Principal | Responsabilidade | Complexidade |
|--------|-------------------|------------------|--------------|
| `auth` | `src/components/auth/LoginView.tsx` | Login simulado por busca de e-mail/nome/ID, tema claro/escuro e solicitação de acesso | Média |
| `dashboard` | `src/components/dashboard/DashboardView.tsx` | Visão geral financeira, progresso das etapas, teto de mão de obra e atalhos | Média |
| `alertas` | `src/components/alertas/AlertasView.tsx` | Central de alertas automáticos (rateio, comprovante, cartão, diárias, teto) | Baixa |
| `cartoes` | `src/components/cartoes/CartoesView.tsx` | Gestão de cartões/contas e controle de parcelas (`a_vencer`, `paga`, `em_atraso`) | Média |
| `despesas` | `src/components/despesas/DespesasView.tsx` | Lançamento de notas fiscais, rateio de itens por etapa/destino, geração de parcelas | Alta |
| `maodeobra` | `src/components/maodeobra/MaoDeObraView.tsx` | Cadastro de trabalhadores e lançamento de diárias (fração + adicional) | Alta |
| `materiais` | `src/components/materiais/MateriaisView.tsx` | Catálogo de materiais e unidades padrão | Baixa |
| `orcamentos` | `src/components/orcamentos/OrcamentosView.tsx` | Cotações de fornecedores e conversão de orçamento aprovado em despesa | Média |
| `producao` | `src/components/producao/ProducaoView.tsx` | Registro de produção própria (ex.: trilhos de laje, placas) | Baixa |
| `recibos` | `src/components/recibos/RecibosView.tsx` | Emissão de recibos de pagamento de diárias com valor por extenso e impressão | Alta |
| `relatorios` | `src/components/relatorios/RelatoriosView.tsx` | Relatórios consolidados da obra e impressão (`relatorioPrintService.ts`) | Média |
| `usuarios` | `src/components/usuarios/UsuariosView.tsx` | Gestão de usuários, perfis (`master`, `admin`, `operador`) e matriz de permissões | Média |

## Algoritmos e Regras de Negócio Principais

1. **Conferência de Rateio (`Despesa`):** `diferencaRateio = valorTotalNota - valorSomaItens`. Se diferente de zero, marca `statusConferencia = 'diferenca_rateio'` e gera alerta. 🟢 CONFIRMADO
2. **Cálculo de Diária (`Diaria`):** `valorCalculado = fracao * valorDiariaBase`; `valorTotal = valorCalculado + valorAdicional`. 🟢 CONFIRMADO
3. **Valor por Extenso (`src/utils/currency.ts`):** Converte `valorTotal` numérico para texto em português no `ReciboPagamento`. 🟢 CONFIRMADO
4. **Impressão Dedicada:** `reciboPrintService.ts` e `relatorioPrintService.ts` preparam dados para `public/print-recibo.html` e `public/print-relatorio.html`. 🟢 CONFIRMADO

