import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 4000;
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= step) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    const autoHideTimer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(autoHideTimer);
    };
  }, [toast, hideToast]);

  if (!toast) return null;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      badge: 'bg-emerald-500',
      progressBar: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      bgIcon: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
      badge: 'bg-rose-500',
      progressBar: 'bg-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      badge: 'bg-amber-500',
      progressBar: 'bg-amber-500',
    },
    info: {
      icon: <Info className="w-5 h-5 text-[#0085db] shrink-0" />,
      bgIcon: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
      badge: 'bg-[#0085db]',
      progressBar: 'bg-[#0085db]',
    },
  }[toast.type || 'success'];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-bottom-3 fade-in duration-200 shadow-2xl rounded-2xl overflow-hidden border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white"
    >
      <div className="p-3.5 sm:p-4 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${config.bgIcon}`}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          {toast.title ? (
            <>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#111c2d] dark:text-white tracking-tight">
                  {toast.title}
                </h4>
              </div>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5 leading-relaxed break-words font-medium">
                {toast.message}
              </p>
            </>
          ) : (
            <p className="text-xs sm:text-sm font-semibold text-[#111c2d] dark:text-white leading-snug break-words">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="p-1 -mr-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress timer bar */}
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
