# Matriz de Permissões (RBAC/ACL) — SISTEMA LIBRA - OBRAS

> Gerado pelo **Detective** em 2026-11-13

---

## Papéis do Sistema (`Usuario.perfil`)

| Papel | Descrição | Fonte |
|-------|-----------|-------|
| `master` | Acesso irrestrito a todos os módulos, gestão de usuários e aprovações | 🟢 CONFIRMADO |
| `admin` | Acesso administrativo completo aos módulos operacionais e financeiros | 🟡 INFERIDO |
| `operador` | Acesso operacional restrito conforme matriz `permissoes` por módulo | 🟢 CONFIRMADO |

---

## Estrutura de Permissões Granulares (`PermissaoModulo`)

Cada `Usuario` possui um mapa `permissoes` indexado por módulo (`TabType`), com 4 flags booleanas:
- `visualizar`
- `criar`
- `editar`
- `excluir`

🟢 CONFIRMADO (fonte: `src/types/index.ts`, `src/components/usuarios/UsuariosView.tsx`)

---

## Matriz Padrão Inferida por Perfil

| Módulo | `master` | `admin` | `operador` |
|--------|----------|---------|------------|
| `dashboard` | V / C / E / X | V / C / E / X | V |
| `despesas` | V / C / E / X | V / C / E / X | V / C / E |
| `maodeobra` | V / C / E / X | V / C / E / X | V / C / E |
| `recibos` | V / C / E / X | V / C / E / X | V / C |
| `orcamentos` | V / C / E / X | V / C / E / X | V / C |
| `materiais` | V / C / E / X | V / C / E / X | V / C |
| `producao` | V / C / E / X | V / C / E / X | V / C |
| `cartoes` | V / C / E / X | V / C / E / X | V |
| `relatorios` | V / C / E / X | V / C / E / X | V |
| `alertas` | V / C / E / X | V / C / E / X | V |
| `usuarios` | V / C / E / X | V / C / E | Sem acesso (padrão) |

Legenda: **V** = Visualizar, **C** = Criar, **E** = Editar, **X** = Excluir. 🟡 INFERIDO

---

## Lacunas

- 🔴 **LACUNA:** Como não há backend conectado, a verificação de permissões ocorre apenas na camada de interface (React). A definição das políticas de RLS (Row Level Security) no banco de dados precisará espelhar essa matriz.

