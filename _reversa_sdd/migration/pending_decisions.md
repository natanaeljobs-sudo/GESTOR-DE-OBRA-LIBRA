# Decisões Pendentes — Time de Migração

> Registrado pelo orquestrador do Reversa em 2026-11-13.
> Pausa solicitada pelo usuário para continuação em nova sessão.

---

### Pausa Atual: Screen Translator (Fase 1 - Modo de Modernização Visual)

- **Status:** Aguardando aprovação humana
- **Arquivo de Decisão:** `_reversa_sdd/migration/screen_modernization_decision.md`
- **Decisão Pendente:**
  - Qual modo de modernização visual adotar para as 12 telas?
    1. **Modernizado (Recomendado):** Preserva o layout visual e textos originais, garante impressão A4 perfeita dos recibos e introduz estados assíncronos (Loading/Toast/Error).
    2. **Literal:** Réplica exata sem estados assíncronos.
    3. **Híbrido:** Telas pontuais diferenciadas.

---

### Como Retomar na Próxima Sessão:
Basta abrir uma nova sessão e digitar:
```text
/reversa-migrate
```
O orquestrador detectará o estado salvo em `_reversa_sdd/migration/.state.json` e retomará exatamente desta decisão!

