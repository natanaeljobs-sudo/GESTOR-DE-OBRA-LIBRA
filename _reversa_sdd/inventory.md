# Inventário do Projeto — SISTEMA LIBRA - OBRAS

> Gerado pelo **Scout** em 2026-11-13

## 1. Visão Geral

- **Linguagem principal:** TypeScript (`.ts`, `.tsx`)
- **Framework:** React 19 + Vite 8 + Tailwind CSS 4 + `vite-plugin-pwa`
- **Gerenciador de pacotes:** Bun (`bun.lock`) / npm (`package.json`)
- **Banco de dados atual:** Nenhum (dados iniciais em `src/data/initialData.ts` e estado em `src/context/AppContext.tsx`)
- **Testes:** Nenhum framework de teste ou arquivo `*.test.*` / `*.spec.*` identificado

## 2. Estrutura de Pastas

```
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── print-recibo.html
│   ├── print-relatorio.html
│   ├── pwa-192x192.png / pwa-512x512.png / apple-touch-icon.png / favicon.ico / icon.svg
│   └── assets/aistudio/ (referências visuais, HTMLs de telas, PDFs e imagens)
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── alertas/       (AlertasView.tsx)
    │   ├── auth/          (LoginView.tsx)
    │   ├── cartoes/       (CartoesView.tsx)
    │   ├── common/        (Modal.tsx, Toast.tsx)
    │   ├── dashboard/     (DashboardView.tsx)
    │   ├── despesas/      (DespesasView.tsx)
    │   ├── layout/        (Header.tsx, MobileNav.tsx, OfflineIndicator.tsx, PWAInstallButton.tsx, Sidebar.tsx)
    │   ├── maodeobra/     (MaoDeObraView.tsx)
    │   ├── materiais/     (MateriaisView.tsx)
    │   ├── orcamentos/    (OrcamentosView.tsx)
    │   ├── producao/      (ProducaoView.tsx)
    │   ├── recibos/       (ReciboPreviewModal.tsx, RecibosView.tsx)
    │   ├── relatorios/    (RelatorioObraImpresso.tsx, RelatorioPreviewModal.tsx, RelatoriosView.tsx)
    │   └── usuarios/      (UsuariosView.tsx)
    ├── context/
    │   └── AppContext.tsx
    ├── data/
    │   └── initialData.ts
    ├── hooks/
    │   ├── useOnlineStatus.ts
    │   └── usePWAInstall.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── currency.ts
        ├── date.ts
        ├── reciboPrintService.ts
        └── relatorioPrintService.ts
```

## 3. Pontos de Entrada e Configurações

- **Entry point web:** `index.html` → `src/main.tsx` → `src/App.tsx`
- **PWA / Service Worker:** configurado via `VitePWA` em `vite.config.ts`
- **Scripts (`package.json`):**
  - `dev`: `vite --port=3000 --host=0.0.0.0`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `lint`: `tsc --noEmit`
- **Variáveis de ambiente:** `.env.example` (`GEMINI_API_KEY`)

