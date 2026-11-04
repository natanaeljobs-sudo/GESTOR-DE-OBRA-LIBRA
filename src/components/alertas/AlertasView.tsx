import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateBR } from '../../utils/date';
import {
  AlertTriangle,
  FileQuestion,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AlertasView: React.FC = () => {
  const { alertas, resolverAlerta, navigateToTabWithFilter } = useApp();

  const handleResolveAndNavigate = (alertaId: string, moduloDestino: string, entidadeId: string) => {
    resolverAlerta(alertaId);
    navigateToTabWithFilter(moduloDestino as any, entidadeId);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
          Central de Pendências & Alertas
        </h1>
        <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
          Conferência de rateios de notas, compras sem comprovante ou cartão, e pagamentos pendentes de mão de obra.
        </p>
      </div>

      {alertas.length === 0 ? (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-12 text-center shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
          <div className="w-12 h-12 rounded-2xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#111c2d] dark:text-white">
            Tudo em dia na Obra Juscelino Mola!
          </h2>
          <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mx-auto mt-1">
            Não há rateios divergentes, comprovantes pendentes ou faturas atrasadas no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map(item => {
            const isHigh = item.severidade === 'alta';
            const isMedium = item.severidade === 'media';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#111c2d] border rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isHigh
                    ? 'border-[#fb977d]/40 bg-[#fb977d]/5'
                    : isMedium
                    ? 'border-[#f8c076]/40 bg-[#f8c076]/5'
                    : 'border-[#e6ecf1] dark:border-[#333f55]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isHigh
                        ? 'bg-[#fb977d]/20 text-[#fb977d]'
                        : isMedium
                        ? 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                        : 'bg-[#0085db]/15 text-[#0085db]'
                    }`}
                  >
                    {isHigh ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isMedium ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <FileQuestion className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-[#fb977d]/20 text-[#fb977d]'
                            : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                        }`}
                      >
                        Severidade {item.severidade}
                      </span>
                      <span className="text-[11px] text-[#707a82]">
                        {formatDateBR(item.dataGerado)}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#111c2d] dark:text-white mt-1">
                      {item.titulo}
                    </h2>
                    <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                      {item.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => resolverAlerta(item.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
                  >
                    Dispensar
                  </button>
                  <button
                    onClick={() => handleResolveAndNavigate(item.id, item.moduloDestino, item.entidadeId)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-colors cursor-pointer"
                  >
                    <span>Resolver no Módulo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
