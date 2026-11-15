import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateBR } from '../../utils/date';
import { AlertaPendencia } from '../../types';

interface ModuloMeta {
  label: string;
  icon: string;
}

const MODULO_META: Record<string, ModuloMeta> = {
  despesas: { label: 'Despesas', icon: 'receipt_long' },
  cartoes: { label: 'Cartões', icon: 'credit_card' },
  maodeobra: { label: 'Diárias', icon: 'group' },
  orcamentos: { label: 'Orçamentos', icon: 'balance' },
  recibos: { label: 'Recibos', icon: 'history_edu' },
  producao: { label: 'Produção', icon: 'precision_manufacturing' },
  materiais: { label: 'Materiais', icon: 'inventory_2' },
  relatorios: { label: 'Relatórios', icon: 'description' },
};

export const AlertasView: React.FC = () => {
  const { alertas, resolverAlerta, navigateToTabWithFilter, showToast, activeObra } = useApp();

  const [alertaResolvendo, setAlertaResolvendo] = useState<AlertaPendencia | null>(null);
  const [alertaDispensando, setAlertaDispensando] = useState<AlertaPendencia | null>(null);

  const handleOpenResolver = (item: AlertaPendencia) => {
    setAlertaResolvendo(item);
  };

  const handleOpenDispensar = (item: AlertaPendencia) => {
    setAlertaDispensando(item);
  };

  const handleConfirmDispensar = () => {
    if (!alertaDispensando) return;
    resolverAlerta(alertaDispensando.id);
    showToast('Notificação dispensada da lista.', 'success', 'Notificações');
    setAlertaDispensando(null);
  };

  const handleIrParaModulo = () => {
    if (!alertaResolvendo) return;
    const { id, moduloDestino, entidadeId } = alertaResolvendo;
    resolverAlerta(id);
    setAlertaResolvendo(null);
    navigateToTabWithFilter(moduloDestino as any, entidadeId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 lg:pb-12 animate-in fade-in duration-150">
      <div className="space-y-6 pb-20 lg:pb-8">

        {/* Header da Página Oficial Stitch */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-headline">
            Notificações
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Alertas e pendências de comprovantes, notas e pagamentos da obra.
          </p>
        </div>

        {/* Empty State */}
        {alertas.length === 0 ? (
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-12 text-center shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
              Tudo em dia na {activeObra ? activeObra.nome : 'Obra'}!
            </h2>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mx-auto mt-1">
              Não há rateios divergentes, comprovantes pendentes ou faturas atrasadas no momento.
            </p>
          </div>
        ) : (
          /* Lista de Notificações / Alertas */
          <div className="space-y-3">
            {alertas.map(item => {
              const meta = MODULO_META[item.moduloDestino] || { label: 'Sistema', icon: 'notifications' };

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#0085db]/40"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Ícone de Módulo Estilizado */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-[#0085db]/10 text-[#0085db]">
                      <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#1a2535] text-[#0085db] border border-[#e6ecf1] dark:border-[#333f55]">
                          {meta.label}
                        </span>
                        <span className="text-[11px] text-[#707a82]">
                          {formatDateBR(item.dataGerado)}
                        </span>
                        {item.severidade === 'alta' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-[#fb977d]/20 text-[#fb977d] border border-[#fb977d]/30">
                            Alta
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-bold text-[#111c2d] dark:text-white mt-1">
                        {item.titulo}
                      </h2>
                      <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                        {item.descricao}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenDispensar(item)}
                      className="px-3.5 py-2 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d40] hover:border-[#d0dbe7] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Dispensar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenResolver(item)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-colors cursor-pointer"
                    >
                      <span>Resolver no Módulo</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL INTEGRADO: RESOLVER NOTIFICAÇÃO                    */}
      {/* ======================================================== */}
      {alertaResolvendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAlertaResolvendo(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-2xl shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2 text-[#0085db]">
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                <h2 className="text-xs font-bold uppercase tracking-wider font-headline text-[#111c2d] dark:text-white">
                  Resolver Pendência
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAlertaResolvendo(null)}
                className="text-[#707a82] hover:text-[#111c2d] dark:hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Informações Essenciais Centralizadas */}
            <div className="space-y-2 text-xs text-center">
              <div className="p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-1 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0085db]">
                  {(MODULO_META[alertaResolvendo.moduloDestino]?.label || alertaResolvendo.moduloDestino).toUpperCase()} • #{alertaResolvendo.entidadeId}
                </span>
                <p className="text-xs font-semibold text-[#111c2d] dark:text-white">
                  {alertaResolvendo.titulo}
                </p>
                <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                  {alertaResolvendo.descricao}
                </p>
              </div>

              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] px-1 text-center">
                Você será direcionado para o módulo de{' '}
                <strong className="text-[#111c2d] dark:text-white">
                  {MODULO_META[alertaResolvendo.moduloDestino]?.label || alertaResolvendo.moduloDestino}
                </strong>{' '}
                para ajustar o lançamento.
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <button
                type="button"
                onClick={() => setAlertaResolvendo(null)}
                className="h-8 px-3 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d40] active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleIrParaModulo}
                className="h-8 px-3.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Ir para {MODULO_META[alertaResolvendo.moduloDestino]?.label || alertaResolvendo.moduloDestino}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL INTEGRADO: DISPENSAR NOTIFICAÇÃO                   */}
      {/* ======================================================== */}
      {alertaDispensando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAlertaDispensando(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-2xl shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2 text-amber-500">
                <span className="material-symbols-outlined text-[20px]">notifications_off</span>
                <h2 className="text-xs font-bold uppercase tracking-wider font-headline text-[#111c2d] dark:text-white">
                  Dispensar Alerta
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAlertaDispensando(null)}
                className="text-[#707a82] hover:text-[#111c2d] dark:hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Informações Essenciais Centralizadas */}
            <div className="space-y-2 text-xs text-center">
              <div className="p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-1 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {(MODULO_META[alertaDispensando.moduloDestino]?.label || alertaDispensando.moduloDestino).toUpperCase()} • #{alertaDispensando.entidadeId}
                </span>
                <p className="text-xs font-semibold text-[#111c2d] dark:text-white">
                  {alertaDispensando.titulo}
                </p>
              </div>

              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] px-1 text-center">
                Deseja dispensar este aviso da lista de notificações?
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <button
                type="button"
                onClick={() => setAlertaDispensando(null)}
                className="h-8 px-3 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d40] active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDispensar}
                className="h-8 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-xs inline-flex items-center justify-center transition-all cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
