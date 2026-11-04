import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        title="Instalar aplicativo de gestão de obra no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#111c2d] dark:text-white border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0085db]" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] p-6 shadow-2xl text-[#111c2d] dark:text-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#0085db]" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#707a82] hover:text-[#111c2d] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#707a82] dark:text-[#7c8fac]">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0085db]/10 text-[#0085db] text-xs font-bold shrink-0">1</span>
                  <p>Abra este site pelo <strong>Safari</strong> e toque no botão <strong>Compartilhar</strong> <Share className="w-4 h-4 inline text-[#0085db]" /> na barra inferior.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0085db]/10 text-[#0085db] text-xs font-bold shrink-0">2</span>
                  <p>Role o menu para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0085db]/10 text-[#0085db] text-xs font-bold shrink-0">3</span>
                  <p>Confirme clicando em <strong>Adicionar</strong> no canto superior direito.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#0085db] hover:bg-[#0071ba] text-white font-bold text-sm shadow-sm transition-opacity cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
