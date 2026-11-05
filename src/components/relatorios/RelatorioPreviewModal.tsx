import React, { useState, useEffect, useRef } from 'react';
import { Obra, Despesa, Diaria, Etapa } from '../../types';
import { RelatorioObraImpresso } from './RelatorioObraImpresso';
import {
  printRelatorioDocument,
  openRelatorioInNewTab,
  downloadRelatorioPDF,
  triggerSystemPrint,
} from '../../utils/relatorioPrintService';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Download,
  ExternalLink,
  Layers,
  Check,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface RelatorioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra;
  despesas: Despesa[];
  diarias: Diaria[];
  etapas: Etapa[];
  dataInicio?: string;
  dataFim?: string;
}

export const RelatorioPreviewModal: React.FC<RelatorioPreviewModalProps> = ({
  isOpen,
  onClose,
  obra,
  despesas,
  diarias,
  etapas,
  dataInicio,
  dataFim,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const scrollToPage = (targetPage: 1 | 2 | 3) => {
    if (targetPage < 1 || targetPage > 3) return;
    setCurrentPage(targetPage);
    isProgrammaticScroll.current = true;

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    const pageEl = document.getElementById(`relatorio-page-${targetPage}`);
    if (pageEl && viewportRef.current) {
      const containerRect = viewportRef.current.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      const currentScrollTop = viewportRef.current.scrollTop;
      const targetScrollTop = currentScrollTop + (pageRect.top - containerRect.top) - 16;
      viewportRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
  };

  // Keyboard navigation for passing pages easily
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentPage < 3) scrollToPage((currentPage + 1) as 1 | 2 | 3);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) scrollToPage((currentPage - 1) as 1 | 2 | 3);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, onClose]);

  // Track scroll position to update currentPage dynamically
  useEffect(() => {
    if (!isOpen) return;
    const container = viewportRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!container) {
            ticking = false;
            return;
          }

          const containerRect = container.getBoundingClientRect();

          // Check if scrolled near the bottom of viewport (handle page 3)
          const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
          if (isAtBottom) {
            setCurrentPage(3);
            ticking = false;
            return;
          }

          let maxVisible = -1;
          let bestPage: 1 | 2 | 3 = 1;

          for (let n = 1; n <= 3; n++) {
            const el = document.getElementById(`relatorio-page-${n}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              const visibleTop = Math.max(rect.top, containerRect.top);
              const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
              const visibleHeight = Math.max(0, visibleBottom - visibleTop);

              if (visibleHeight > maxVisible) {
                maxVisible = visibleHeight;
                bestPage = n as 1 | 2 | 3;
              }
            }
          }

          if (maxVisible > 0) {
            setCurrentPage(bestPage);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Auto-fit zoom calculation based on viewport width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);

      if (mobile) {
        // A4 width in px is roughly 794px. We add a safe margin so it fits phone screen nicely
        const idealMobileZoom = Math.min(0.85, Math.max(0.38, Number(((width - 24) / 820).toFixed(2))));
        setZoom(idealMobileZoom);
      } else {
        setZoom(0.85);
      }
    };

    if (isOpen) {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Sync print events
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await triggerSystemPrint({
        obra,
        despesas,
        diarias,
        etapas,
        dataInicio,
        dataFim,
        autoPrint: true,
      });
    } catch (err) {
      console.warn('Erro ao acionar impressão do sistema:', err);
      handleDownloadPDF();
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

  const handleOpenNewTab = () => {
    openRelatorioInNewTab({
      obra,
      despesas,
      diarias,
      etapas,
      dataInicio,
      dataFim,
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const ok = await downloadRelatorioPDF(obra.id, obra.nome);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        setDownloadError('Erro ao baixar');
        setTimeout(() => setDownloadError(null), 3500);
      }
    } catch (err) {
      console.error('Falha ao baixar PDF:', err);
      setDownloadError('Erro');
      setTimeout(() => setDownloadError(null), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFitScreen = () => {
    const width = window.innerWidth;
    const targetZoom = width < 768
      ? Math.min(0.85, Math.max(0.38, Number(((width - 24) / 820).toFixed(2))))
      : Math.min(1.1, Number(((width - 120) / 840).toFixed(2)));
    setZoom(targetZoom);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-xs flex flex-col animate-in fade-in duration-150 select-none preview-modal-root">
      
      {/* =========================================================================
          TOP ACTION BAR
      ========================================================================= */}
      <header className="h-14 sm:h-16 bg-[#111c2d] border-b border-[#333f55] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg print:hidden">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0085db]/20 flex items-center justify-center text-[#0085db] shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                Relatório Impresso
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0085db]/20 text-[#38bdf8] border border-[#0085db]/30 shrink-0">
                A4 · 3 Páginas
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#7c8fac] truncate">
              {obra.nome} · Pronto para impressão ou PDF
            </p>
          </div>
        </div>

        {/* Center: Interactive Paginator < 1 > matching user focus */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#162232] p-1 rounded-xl border border-[#333f55] shadow-xs">
            {/* Previous Page Button < */}
            <button
              type="button"
              onClick={() => scrollToPage((currentPage - 1) as 1 | 2 | 3)}
              disabled={currentPage <= 1}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                currentPage <= 1
                  ? 'border-[#26354a] bg-[#111c2d]/50 text-zinc-600 opacity-40 cursor-not-allowed'
                  : 'border-[#333f55] bg-[#111c2d] text-zinc-300 hover:text-white hover:border-[#0085db]/60 hover:bg-[#1a293d] active:scale-95'
              }`}
              title="Página anterior"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>

            {/* Current Page Display: < 1 > / < 2 > / < 3 > */}
            <button
              type="button"
              onClick={() => scrollToPage(currentPage === 3 ? 1 : ((currentPage + 1) as 1 | 2 | 3))}
              className="min-w-7 sm:min-w-8 h-7 sm:h-8 px-2.5 rounded-lg border border-[#0085db] bg-[#0085db] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-sm shadow-[#0085db]/30 select-none tabular-nums cursor-pointer hover:bg-[#0071ba] active:scale-95 transition-all"
              title={`Página ${currentPage} de 3 (Clique para alternar)`}
              aria-label={`Página atual ${currentPage}`}
            >
              {currentPage}
            </button>

            {/* Next Page Button > */}
            <button
              type="button"
              onClick={() => scrollToPage((currentPage + 1) as 1 | 2 | 3)}
              disabled={currentPage >= 3}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                currentPage >= 3
                  ? 'border-[#26354a] bg-[#111c2d]/50 text-zinc-600 opacity-40 cursor-not-allowed'
                  : 'border-[#333f55] bg-[#111c2d] text-zinc-300 hover:text-white hover:border-[#0085db]/60 hover:bg-[#1a293d] active:scale-95'
              }`}
              title="Próxima página"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Zoom Controls (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center gap-1 bg-[#162232] rounded-xl border border-[#333f55] p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.35, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-zinc-300 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitScreen}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Ajustar à Tela"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Open in New Tab (Essential fallback for mobile iOS & Android) */}
          <button
            onClick={handleOpenNewTab}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-[#162232] hover:bg-[#1f2d42] border border-[#333f55] transition-colors cursor-pointer"
            title="Abrir em Nova Aba (Ideal para celular ou salvar direto)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Nova Aba</span>
          </button>

          {/* Download Official PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              downloadSuccess
                ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/50'
                : downloadError
                ? 'bg-red-600/25 text-red-300 border-red-500/50'
                : 'text-zinc-200 bg-[#162232] hover:bg-[#1f2d42] border-[#333f55] active:scale-95'
            }`}
            title="Baixar arquivo PDF consolidado oficial (3 páginas)"
          >
            {downloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Download className={`w-3.5 h-3.5 text-[#4bd08b] shrink-0 ${isDownloading ? 'animate-bounce' : ''}`} />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? 'Baixando...' : downloadSuccess ? 'Baixado!' : downloadError ? downloadError : 'Baixar PDF'}
            </span>
            <span className="sm:hidden">
              {isDownloading ? '...' : downloadSuccess ? 'OK' : 'PDF'}
            </span>
          </button>

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

          <div className="h-5 w-px bg-[#333f55] mx-0.5"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar Pré-visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Page Switcher Bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#162232] border-b border-[#333f55] text-xs print:hidden">
        <div className="flex items-center gap-1 text-[11px] text-[#7c8fac] font-medium truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0085db]"></span>
          <span className="truncate">
            {currentPage === 1
              ? 'Página 1 · Resumo Executivo'
              : currentPage === 2
              ? 'Página 2 · Materiais e Compras'
              : 'Página 3 · Mão de Obra'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-300">
          <button
            onClick={handleFitScreen}
            className="px-2 py-1 rounded-md bg-[#111c2d] text-[10px] font-semibold border border-[#333f55]"
          >
            Ajustar
          </button>
          <span className="font-mono text-[10px] text-zinc-400">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* =========================================================================
          PAGES VIEWPORT CONTAINER
      ========================================================================= */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center bg-[#0d1624] preview-viewport scroll-smooth"
      >
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center gap-8 pb-20 select-text preview-zoom-canvas"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Individual A4 sheets rendered with realistic paper look */}
          <RelatorioObraImpresso
            obra={obra}
            despesas={despesas}
            diarias={diarias}
            etapas={etapas}
            dataInicio={dataInicio}
            dataFim={dataFim}
            isPrintOnly={false}
          />
        </div>
      </div>

      {/* =========================================================================
          MOBILE FLOATING HINT & QUICK ACTIONS (Visible on small screens)
      ========================================================================= */}
      <div className="sm:hidden bg-[#111c2d] border-t border-[#333f55] p-3 flex items-center justify-between gap-2 shadow-2xl print:hidden">
        <div className="flex items-center gap-2 text-[11px] text-[#7c8fac]">
          <Smartphone className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
          <span className="truncate">Celular: Imprima ou baixe o PDF</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-lg bg-[#162232] border border-[#333f55] text-xs font-semibold text-white flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className={`w-3.5 h-3.5 text-[#4bd08b] ${isDownloading ? 'animate-bounce' : ''}`} />
            )}
            <span>{isDownloading ? '...' : downloadSuccess ? 'OK' : 'PDF'}</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-3.5 py-1.5 rounded-lg bg-[#0085db] text-xs font-bold text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? '...' : 'Imprimir'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
