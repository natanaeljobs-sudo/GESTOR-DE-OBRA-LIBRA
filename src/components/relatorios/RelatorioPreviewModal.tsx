import React, { useState } from 'react';
import { Obra, Despesa, Diaria, Etapa } from '../../types';
import { RelatorioObraImpresso } from './RelatorioObraImpresso';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex flex-col animate-in fade-in duration-150 print:hidden">
      
      {/* Top Action Bar */}
      <div className="h-14 bg-[#111c2d] border-b border-[#333f55] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0085db]/20 flex items-center justify-center text-[#0085db]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Pré-visualização do Relatório Impresso</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0085db]/20 text-[#0085db] border border-[#0085db]/30">
                A4 · 3 Páginas
              </span>
            </h2>
            <p className="text-[11px] text-[#7c8fac]">
              {obra.nome} · Pronto para impressão ou download em PDF
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg bg-[#162232] text-white hover:bg-[#1f2d42] border border-[#333f55] transition-colors"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Label */}
          <span className="text-xs font-mono text-zinc-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
            className="p-1.5 rounded-lg bg-[#162232] text-white hover:bg-[#1f2d42] border border-[#333f55] transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset Fit */}
          <button
            onClick={() => setZoom(0.85)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#162232] text-xs font-medium text-white hover:bg-[#1f2d42] border border-[#333f55] transition-colors"
            title="Ajustar à Tela"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#7c8fac]" />
            <span>Ajustar</span>
          </button>

          <div className="h-5 w-px bg-[#333f55] mx-1"></div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 shadow-sm shadow-[#0085db]/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-1"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pages Viewport Container */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-8 flex justify-center bg-[#15263a]/90">
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center gap-8 pb-12"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* The 3 pages styled exactly as the printed report */}
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
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
      </div>

    </div>
  );
};
