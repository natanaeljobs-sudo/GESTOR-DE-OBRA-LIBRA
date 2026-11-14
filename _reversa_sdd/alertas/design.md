# Unit: Central de Alertas e Pendências (alertas), Design Técnico

> Especificação Técnica do Módulo de Alertas.

## Interface

### Componente React
- `AlertasView: React.FC`
  - Consome o estado operacional via hook `useApp()`.

### Estrutura de Dados do Alerta

```typescript
interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  severidade: 'alta' | 'media' | 'baixa';
  data: string; // YYYY-MM-DD
  moduloDestino?: string;
  entidadeId?: string;
}
```

### Funções Consumidas (`useApp`)

| Função / Propriedade | Tipo | Finalidade |
|----------------------|------|------------|
| `alertas` | `Alerta[]` | Lista reativa de alertas ativos |
| `resolverAlerta` | `(id: string) => void` | Remove ou marca o alerta como solucionado no estado global |
| `navigateToTabWithFilter` | `(tab: TabType, filterId?: string) => void` | Redireciona o usuário para o módulo onde a pendência deve ser tratada |

## Fluxo Principal de Resolução
1. Usuário identifica a pendência na lista.
2. Clica no botão de ação da linha correspondente: `handleResolveAndNavigate(alertaId, moduloDestino, entidadeId)`.
3. O método invoca `resolverAlerta(alertaId)`, excluindo o alerta do array `alertas` mantido no `AppContext`.
4. O método invoca `navigateToTabWithFilter(moduloDestino, entidadeId)`, alterando o estado da aba ativa e passando o ID da entidade para filtragem ou abertura de modal no destino.

## Fluxos Alternativos
- **Alerta sem módulo/entidade:**
  - O botão atua apenas como fechamento/dispensa do alerta sem acionar navegação externa.
- **Lista vazia (`alertas.length === 0`):**
  - Renderiza card estilizado de conformidade com ícone `CheckCircle2` verde e mensagem tranquilizadora.

## Dependências
- `src/context/AppContext.tsx`: Estado dos alertas e métodos de resolução.
- `src/utils/date.ts`: Formatação de data via `formatDateBR`.
- `lucide-react`: Ícones de status (`AlertTriangle`, `FileQuestion`, `CheckCircle2`, `ArrowRight`, `ShieldAlert`).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Resolução com navegação em uma única ação | `handleResolveAndNavigate` em `AlertasView.tsx:15-18` | 🟢 |
| Três níveis de severidade visual | Classes condicionais de cor e background baseadas em `item.severidade` | 🟢 |
| Persistência e geração em memória | Alertas são computados ou mantidos em memória no `AppContext` | 🟢 |

## Riscos e Lacunas
- 🟡 No código legado, a string `moduloDestino` é convertida com `as any` ao chamar `navigateToTabWithFilter`. Recomenda-se tipagem estrita com enum das abas disponíveis (`TabType`).

