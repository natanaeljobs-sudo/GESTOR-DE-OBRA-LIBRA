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

  const [searchTerm, setSearchTerm] = useState('');
  const [currentFiltroModulo, setCurrentFiltroModulo] = useState<string>('todos');

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

  // Filtragem idêntica aos scripts dos arquivos HTML Stitch
  const filteredAlertas = alertas.filter(item => {
    const matchModulo =
      currentFiltroModulo === 'todos' || item.moduloDestino === currentFiltroModulo;
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.titulo.toLowerCase().includes(q) ||
      item.descricao.toLowerCase().includes(q) ||
      item.entidadeId.toLowerCase().includes(q);
    return matchModulo && matchSearch;
  });

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      
      {/* ======================================================== */}
      {/* 1. CABEÇALHO DA PÁGINA (MOBILE / TABLET / DESKTOP)       */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-headline">
              Notificações
            </h1>
            <span className="sm:hidden px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20">
              {alertas.length} ativas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac]">
            Alertas e pendências de comprovantes, notas e pagamentos da obra.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20">
            {alertas.length} ativas
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BANNER RESUMO INFORMATIVO (DESIGN TABLET / DESKTOP)    */}
      {/* ======================================================== */}
      <div className="hidden sm:flex bg-[#0085db]/10 border border-[#0085db]/25 rounded-[18px] px-4 py-3 items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[20px] text-[#0085db] shrink-0">info</span>
          <p className="text-[#111c2d] dark:text-white uppercase tracking-wider text-[11px] truncate">
            <strong className="font-extrabold text-[#0085db]">PENDÊNCIAS OPERACIONAIS:</strong> NOTAS COM RATEIO PENDENTE E DIÁRIAS SEM COMPROVANTE
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#0085db] uppercase tracking-wider shrink-0 bg-white dark:bg-[#111c2d] px-2.5 py-1 rounded-lg border border-[#0085db]/20">
          Atualizado
        </span>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE BUSCA E SEGMENTED FILTRO POR MÓDULO          */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl sm:rounded-[18px] p-2.5 sm:p-3 shadow-xs space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        
        {/* Segmented Buttons por Módulo */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 sm:pt-0">
          <button
            type="button"
            onClick={() => setCurrentFiltroModulo('todos')}
            className={`px-3 py-1 sm:h-9 sm:px-3.5 inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
              currentFiltroModulo === 'todos'
                ? 'bg-[#0085db] text-white shadow-xs'
                : 'text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-extrabold">
              {alertas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentFiltroModulo('despesas')}
            className={`px-2.5 py-1 sm:h-9 sm:px-3.5 inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              currentFiltroModulo === 'despesas'
                ? 'bg-[#0085db] text-white font-bold shadow-xs'
                : 'text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">receipt_long</span>
            <span>Despesas</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentFiltroModulo('maodeobra')}
            className={`px-2.5 py-1 sm:h-9 sm:px-3.5 inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              currentFiltroModulo === 'maodeobra'
                ? 'bg-[#0085db] text-white font-bold shadow-xs'
                : 'text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">group</span>
            <span>Diárias</span>
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#707a82]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar aviso ou nota..."
            className="w-full h-8 sm:h-9 pl-9 pr-3 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. LISTA DE NOTIFICAÇÕES (RESPONSIVO EXATO DO STITCH)    */}
      {/* ======================================================== */}
      {filteredAlertas.length === 0 ? (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl sm:rounded-[18px] p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
            Tudo em dia na {activeObra ? activeObra.nome : 'obra'}!
          </h2>
          <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mx-auto mt-1">
            Não há pendências de rateios, notas ou recibos no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlertas.map(item => {
            const moduloInfo = MODULO_META[item.moduloDestino] || { label: 'Sistema', icon: 'notifications' };

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl sm:rounded-[18px] p-4 sm:p-5 shadow-xs sm:shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all hover:border-[#0085db]/40"
              >
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#0085db]/10 text-[#0085db] mt-0.5">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                      {moduloInfo.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#1a2535] text-[#0085db] border border-[#e6ecf1] dark:border-[#333f55]">
                        {moduloInfo.label}
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

                    <h2 className="text-xs sm:text-sm font-bold text-[#111c2d] dark:text-white mt-1 leading-snug">
                      {item.titulo}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e6ecf1] dark:border-[#333f55] shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenDispensar(item)}
                    className="h-8 px-3 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d40] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Dispensar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenResolver(item)}
                    className="h-8 px-3.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Resolver</span>
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL RESOLVER PENDÊNCIA (BOTTOM SHEET MOBILE / MODAL PC)*/}
      {/* ======================================================== */}
      {alertaResolvendo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setAlertaResolvendo(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-t-[28px] sm:rounded-2xl shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 space-y-3.5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            
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
                className="h-9 px-3.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleIrParaModulo}
                className="h-9 px-4 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Ir para {MODULO_META[alertaResolvendo.moduloDestino]?.label || alertaResolvendo.moduloDestino}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DISPENSAR NOTIFICAÇÃO (BOTTOM SHEET MOBILE / MODAL) */}
      {/* ======================================================== */}
      {alertaDispensando && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setAlertaDispensando(null)}
            className="absolute inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111c2d] rounded-t-[28px] sm:rounded-2xl shadow-2xl border border-[#e6ecf1] dark:border-[#333f55] p-5 space-y-3.5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            
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
                className="h-9 px-3.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDispensar}
                className="h-9 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-xs inline-flex items-center justify-center transition-all cursor-pointer"
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
