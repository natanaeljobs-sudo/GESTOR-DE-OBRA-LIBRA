import React, { useState, useEffect, useRef } from 'react';
import { ReciboPagamento } from '../../types';
import { formatBRL } from '../../utils/currency';
import { triggerReciboInPagePrint } from '../../utils/reciboPrintService';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  FileCheck2,
  Building2,
  User,
} from 'lucide-react';

interface ReciboPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recibo: ReciboPagamento | null;
  obraNome?: string;
}

export const ReciboPreviewModal: React.FC<ReciboPreviewModalProps> = ({
  isOpen,
  onClose,
  recibo,
  obraNome = 'Obra',
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle fit screen calculation
  const handleFitScreen = () => {
    const width = window.innerWidth;
    const targetZoom = width < 768
      ? Math.min(0.85, Math.max(0.38, Number(((width - 24) / 820).toFixed(2))))
      : Math.min(1.1, Number(((width - 120) / 840).toFixed(2)));
    setZoom(targetZoom);
  };

  // Auto-fit on initial open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      handleFitScreen();
    }
  }, [isOpen]);

  if (!isOpen || !recibo) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await triggerReciboInPagePrint(recibo, obraNome);
    } catch (err) {
      console.warn('Erro ao acionar impressão:', err);
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

  const getFormattedCityDate = (dataISO: string, cidade?: string) => {
    const cityName = cidade || 'Goiânia - GO';
    try {
      const d = new Date(`${dataISO}T12:00:00`);
      const meses = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const dia = d.getDate();
      const mes = meses[d.getMonth()];
      const ano = d.getFullYear();
      return `${cityName.toUpperCase()}, ${dia} de ${mes} de ${ano}`;
    } catch {
      return `${cityName.toUpperCase()}, ${dataISO}`;
    }
  };

  const renderViaContent = (viaNumber: 1 | 2, viaLabel: string) => {
    const cpfFormatted =
      recibo.trabalhadorCpf && recibo.trabalhadorCpf !== 'Não informado'
        ? recibo.trabalhadorCpf
        : '';

    return (
      <div
        key={viaNumber}
        className="flex flex-col justify-between p-6 bg-white text-[#111c2d] rounded-xl border border-slate-200/90 shadow-2xs"
        style={{ minHeight: '380px' }}
      >
        <div>
          {/* Header metadata row */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#0085db] text-xs">
                {recibo.numeroRecibo}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-semibold text-slate-700 text-xs truncate max-w-[260px]">
                {obraNome}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {viaLabel}
              </span>
            </div>
          </div>

          {/* Title matching user reference */}
          <div className="text-center my-3">
            <h2 className="text-base sm:text-lg font-black tracking-wider text-[#111c2d] uppercase">
              RECIBO DE PAGAMENTO
            </h2>
          </div>

          {/* Reference Body Text */}
          <div className="my-4 text-justify text-xs sm:text-sm leading-relaxed text-[#111c2d]">
            <p>
              Eu, <strong className="uppercase">{recibo.trabalhadorNome}</strong>
              {cpfFormatted ? (
                <>, portador do CPF Nº <strong>{cpfFormatted}</strong></>
              ) : ''} recebi de <strong className="uppercase">{recibo.responsavelNome}</strong>, a importância de{' '}
              <strong className="text-[#111c2d] tabular-nums">{formatBRL(recibo.valorTotal)}</strong>{' '}
              ({recibo.valorPorExtenso}) referente à ({recibo.motivo}).
            </p>
            {recibo.observacoes && (
              <p className="text-[11px] text-[#707a82] italic mt-2">
                <strong>Obs:</strong> {recibo.observacoes}
              </p>
            )}
          </div>
        </div>

        {/* Date and Signature Area */}
        <div className="mt-4 pt-2">
          <p className="text-right text-xs sm:text-sm font-semibold text-[#111c2d] mb-8">
            {getFormattedCityDate(recibo.dataEmissao, recibo.localCidade)}
          </p>

          <div className="max-w-md mx-auto text-center">
            <div className="border-t border-slate-900 w-full mb-1.5" />
            <p className="font-bold text-xs sm:text-sm text-[#111c2d] uppercase tracking-wide">
              {recibo.trabalhadorNome}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#707a82]">
              Assinatura do Recebedor
              {cpfFormatted ? ` · CPF: ${cpfFormatted}` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-xs flex flex-col animate-in fade-in duration-150 select-none preview-modal-root">
      
      {/* =========================================================================
          TOP ACTION BAR (Design System Spike dark header)
      ========================================================================= */}
      <header className="h-14 sm:h-16 bg-[#111c2d] border-b border-[#333f55] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg print:hidden">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0085db]/20 flex items-center justify-center text-[#0085db] shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0085db]">
                {recibo.numeroRecibo}
              </span>
              <span className="text-zinc-500">·</span>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate uppercase">
                {recibo.trabalhadorNome}
              </h2>
            </div>
            <p className="text-[11px] text-[#7c8fac] truncate flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>{obraNome}</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">{formatBRL(recibo.valorTotal)}</span>
            </p>
          </div>
        </div>

        {/* Center: Badge */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0085db]/15 text-[#0085db] border border-[#0085db]/25">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Recibo A4 Oficial · 2 Vias (Pagador + Recebedor)</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 shadow-md shadow-[#0085db]/30 transition-all cursor-pointer disabled:opacity-50"
            title="Abrir impressão do sistema (Impressora / Salvar PDF)"
          >
            <Printer className={`w-4 h-4 shrink-0 ${isPrinting ? 'animate-pulse' : ''}`} />
            <span>{isPrinting ? 'Abrindo impressão...' : 'Imprimir'}</span>
          </button>

          <div className="h-5 w-px bg-[#333f55] mx-0.5" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar Pré-visualização (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          VIEWPORT CONTAINER
      ========================================================================= */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center bg-[#0d1624] preview-viewport scroll-smooth"
      >
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center pb-20 select-text preview-zoom-canvas"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* A4 Sheet Container: 210mm x 297mm (794px x 1123px) */}
          <div
            id="recibo-sheet-preview"
            className="w-[794px] min-h-[1080px] bg-white text-[#111c2d] rounded-sm shadow-[0_10px_25px_rgba(0,0,0,0.35)] p-8 sm:p-10 flex flex-col justify-between font-sans relative border border-slate-200"
          >
            {/* 1ª Via (Metade Superior) */}
            {renderViaContent(1, '1ª Via · Pagador / Contabilidade')}

            {/* Linha de corte horizontal central com tesourinha */}
            <div className="recibo-cut-line relative my-4 py-2 flex items-center justify-center select-none">
              <div className="w-full border-t border-dashed border-zinc-400" />
              <span className="absolute bg-white px-3 text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1.5 uppercase">
                ✂ <span>Linha de corte · Separar as 2 vias no canteiro</span> ✂
              </span>
            </div>

            {/* 2ª Via (Metade Inferior) */}
            {renderViaContent(2, '2ª Via · Recebedor / Trabalhador')}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FLOATING BOTTOM-LEFT INDICATOR
      ========================================================================= */}
      <div 
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 print:hidden flex items-center bg-[#111c2d]/95 backdrop-blur-md border border-[#333f55] shadow-2xl rounded-2xl px-3 py-1.5 select-none"
        role="status"
      >
        <span className="text-xs sm:text-sm font-mono font-bold text-zinc-100 tabular-nums tracking-wide flex items-center gap-1.5">
          <span className="text-[#0085db] font-black text-sm sm:text-base">1 Folha</span>
          <span className="text-zinc-500 font-normal">·</span>
          <span className="text-zinc-300 text-sm sm:text-base font-semibold">2 Vias</span>
        </span>
      </div>

      {/* =========================================================================
          FLOATING BOTTOM-RIGHT ZOOM CONTROLS
      ========================================================================= */}
      <div 
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 print:hidden flex items-center gap-1.5 bg-[#111c2d]/95 backdrop-blur-md border border-[#333f55] shadow-2xl rounded-2xl px-2 py-1.5 transition-all hover:border-[#0085db]/50 hover:bg-[#162232]/95 group"
        role="toolbar"
        aria-label="Controles de zoom do recibo"
      >
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.35, Number((z - 0.1).toFixed(2))))}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Reduzir Zoom (-10%)"
          aria-label="Reduzir Zoom"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoom(0.85)}
          className="text-xs font-mono font-medium text-zinc-200 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer select-none tabular-nums text-center min-w-[42px]"
          title="Clique para redefinir zoom para 85%"
          aria-label="Redefinir Zoom para 85%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Aumentar Zoom (+10%)"
          aria-label="Aumentar Zoom"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="h-4 w-px bg-[#333f55] mx-0.5" />

        <button
          type="button"
          onClick={handleFitScreen}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Ajustar à Tela"
          aria-label="Ajustar à Tela"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

    </div>
  );
};
