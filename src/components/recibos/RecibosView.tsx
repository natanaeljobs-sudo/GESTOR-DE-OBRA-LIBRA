import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReciboPagamento } from '../../types';
import { formatBRL, valorPorExtenso } from '../../utils/currency';
import { formatDateBR, formatDateExtendedBR, getTodayISO, getWeekRange } from '../../utils/date';
import {
  FileCheck2,
  Printer,
  Copy,
  Check,
  Calendar,
  Users2,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const RecibosView: React.FC = () => {
  const {
    trabalhadores,
    diarias,
    recibos,
    emitirRecibo,
    activeObra,
    activeUser,
  } = useApp();

  const [selectedTrabId, setSelectedTrabId] = useState<string>(trabalhadores[0]?.id || '');
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('all');
  const [selectedDiariasIds, setSelectedDiariasIds] = useState<string[]>([]);
  const [motivo, setMotivo] = useState(`Pagamento referente a serviços de mão de obra prestados na ${activeObra.nome}`);
  const [responsavelNome, setResponsavelNome] = useState(`${activeUser.nome} (Responsável Técnico / Obra)`);
  const [localCidade, setLocalCidade] = useState('Goiânia - GO');
  const [marcarComoPagas, setMarcarComoPagas] = useState(true);

  const [previewRecibo, setPreviewRecibo] = useState<ReciboPagamento | null>(null);
  const [copied, setCopied] = useState(false);

  const workerDiarias = useMemo(() => {
    return diarias
      .filter(d => d.trabalhadorId === selectedTrabId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [diarias, selectedTrabId]);

  const availableWeeks = useMemo(() => {
    const weeks: Record<string, { label: string; start: string; end: string; count: number }> = {};
    workerDiarias.forEach(d => {
      const range = getWeekRange(d.data);
      const key = `${range.segunda}_${range.domingo}`;
      if (!weeks[key]) {
        weeks[key] = { label: range.label, start: range.segunda, end: range.domingo, count: 0 };
      }
      weeks[key].count++;
    });
    return weeks;
  }, [workerDiarias]);

  const toggleDiariaSelection = (id: string) => {
    setSelectedDiariasIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectWeek = (weekKey: string) => {
    setSelectedWeekKey(weekKey);
    if (weekKey === 'all') {
      setSelectedDiariasIds(workerDiarias.map(d => d.id));
    } else {
      const [start, end] = weekKey.split('_');
      const inWeek = workerDiarias
        .filter(d => d.data >= start && d.data <= end)
        .map(d => d.id);
      setSelectedDiariasIds(inWeek);
    }
  };

  const handleSelectOnlyPending = () => {
    const pending = workerDiarias.filter(d => d.statusPagamento === 'pendente').map(d => d.id);
    setSelectedDiariasIds(pending);
  };

  const selectedDiariasList = workerDiarias.filter(d => selectedDiariasIds.includes(d.id));
  const totalReciboCalculado = selectedDiariasList.reduce((sum, d) => sum + d.valorTotal, 0);

  const handleGenerate = () => {
    if (selectedDiariasIds.length === 0) {
      alert('Selecione ao menos um dia trabalhado para emitir o recibo.');
      return;
    }

    const trab = trabalhadores.find(t => t.id === selectedTrabId);
    if (!trab) return;

    const dates = selectedDiariasList.map(d => d.data).sort();
    const startDate = dates[0] || getTodayISO();
    const endDate = dates[dates.length - 1] || getTodayISO();

    const novoRecibo = emitirRecibo({
      trabalhadorId: trab.id,
      diariasIds: selectedDiariasIds,
      periodoInicio: startDate,
      periodoFim: endDate,
      motivo,
      responsavelNome,
      localCidade,
      marcarComoPagas,
    });

    setPreviewRecibo(novoRecibo);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (rec: ReciboPagamento) => {
    const text = `
RECIBO DE PAGAMENTO - ${rec.numeroRecibo}
OBRA: ${activeObra.nome}

Recebi de ${rec.responsavelNome} a importância líquida de:
VALOR: ${formatBRL(rec.valorTotal)} (${rec.valorPorExtenso})

REFERENTE A:
${rec.motivo}
Período: ${formatDateBR(rec.periodoInicio)} a ${formatDateBR(rec.periodoFim)}

${rec.localCidade}, ${formatDateBR(rec.dataEmissao)}

_________________________________________
Assinatura
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Gerador Automático de Recibos
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Emita recibos oficiais de mão de obra com valor por extenso, dias específicos e modelo para impressão.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
            <h2 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <Users2 className="w-4 h-4 text-[#0085db]" />
              1. Selecionar Trabalhador & Período
            </h2>

            {/* Select worker */}
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Trabalhador
              </label>
              <select
                value={selectedTrabId}
                onChange={e => {
                  setSelectedTrabId(e.target.value);
                  setSelectedDiariasIds([]);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold"
              >
                {trabalhadores.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.funcao} · CPF: {t.cpf || 'Não cadastrado'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick week filter */}
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Filtrar Semana de Trabalho
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedWeekKey}
                  onChange={e => handleSelectWeek(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                >
                  <option value="all">Todas as semanas</option>
                  {Object.entries(availableWeeks).map(([key, w]) => (
                    <option key={key} value={key}>
                      Semana: {w.label} ({w.count} diárias)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSelectOnlyPending}
                  className="px-3 py-1 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 rounded-xl border border-[#0085db]/20 hover:bg-[#0085db]/20 whitespace-nowrap cursor-pointer"
                  title="Seleciona apenas as diárias ainda não pagas"
                >
                  Apenas Pendentes
                </button>
              </div>
            </div>

            {/* Days Selection Checklist */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#111c2d] dark:text-white">
                  Dias incluídos no recibo ({selectedDiariasIds.length} selecionados)
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedDiariasIds(workerDiarias.map(d => d.id))}
                  className="text-[11px] font-semibold text-[#0085db] hover:underline cursor-pointer"
                >
                  Marcar todos
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-[#e6ecf1] dark:border-[#333f55] rounded-xl p-2.5 bg-[#f6f9fc] dark:bg-[#1a2535]">
                {workerDiarias.length === 0 ? (
                  <p className="text-xs text-[#707a82] py-3 text-center">
                    Nenhuma diária registrada para este trabalhador.
                  </p>
                ) : (
                  workerDiarias.map(dia => {
                    const isSelected = selectedDiariasIds.includes(dia.id);
                    return (
                      <label
                        key={dia.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#0085db]/15 text-[#0085db] font-bold'
                            : 'hover:bg-white dark:hover:bg-[#111c2d] text-[#111c2d] dark:text-[#7c8fac]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDiariaSelection(dia.id)}
                            className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db]"
                          />
                          <div>
                            <span>{formatDateBR(dia.data)}</span>
                            <span className="text-[10px] text-[#707a82] ml-1.5">
                              ({dia.fracao === 1 ? 'Integral' : `${dia.fracao} diária`})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold tabular-nums">{formatBRL(dia.valorTotal)}</span>
                          <span
                            className={`block text-[9px] font-bold ${
                              dia.statusPagamento === 'pago' ? 'text-[#4bd08b]' : 'text-[#f8c076]'
                            }`}
                          >
                            {dia.statusPagamento === 'pago' ? 'Pago' : 'A Pagar'}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Customization Fields */}
            <div className="space-y-3 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                  Motivo do Pagamento
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Nome de Quem Pagou
                  </label>
                  <input
                    type="text"
                    value={responsavelNome}
                    onChange={e => setResponsavelNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    value={localCidade}
                    onChange={e => setLocalCidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={marcarComoPagas}
                  onChange={e => setMarcarComoPagas(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db]"
                />
                <span className="font-semibold text-[#111c2d] dark:text-white">
                  Marcar automaticamente as diárias como pagas ao emitir
                </span>
              </label>
            </div>

            {/* Total Callout & Submit */}
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-[#707a82] font-medium">Valor total do recibo:</span>
                <span className="text-xl font-black text-[#0085db] tabular-nums">
                  {formatBRL(totalReciboCalculado)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedDiariasIds.length === 0}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-[#0085db]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Gerar Recibo Oficial</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Receipt Preview */}
        <div className="lg:col-span-7">
          {previewRecibo ? (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#111c2d] p-3.5 rounded-[18px] border border-[#e6ecf1] dark:border-[#333f55]">
                <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                  Recibo #{previewRecibo.numeroRecibo}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(previewRecibo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] text-[#111c2d] dark:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#4bd08b]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-[#0085db] hover:bg-[#0071ba] text-white transition-colors shadow-sm shadow-[#0085db]/25 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Recibo</span>
                  </button>
                </div>
              </div>

              {/* Official Receipt Sheet Document */}
              <div
                id="receipt-print-area"
                className="bg-white text-[#111c2d] border border-slate-300 rounded-[18px] p-6 sm:p-8 shadow-sm font-sans text-xs sm:text-sm leading-relaxed"
              >
                {/* Header */}
                <div className="text-center pb-4 border-b-2 border-[#111c2d] mb-6">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111c2d] uppercase">
                    RECIBO DE PAGAMENTO
                  </h1>
                  <p className="text-xs font-semibold text-[#707a82] mt-1">
                    {previewRecibo.numeroRecibo} · {activeObra.nome}
                  </p>
                </div>

                {/* Amount Box */}
                <div className="flex justify-between items-center bg-[#f0f5f9] p-4 rounded-xl border border-slate-300 mb-6">
                  <span className="font-bold text-[#707a82] text-xs uppercase tracking-wider">
                    VALOR TOTAL LÍQUIDO:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#0085db] tabular-nums">
                    {formatBRL(previewRecibo.valorTotal)}
                  </span>
                </div>

                {/* Legal body prose */}
                <div className="space-y-4 text-justify">
                  <p>
                    Recebi(emos) de <strong>{previewRecibo.responsavelNome}</strong> a importância de{' '}
                    <strong>{formatBRL(previewRecibo.valorTotal)}</strong> (
                    <span className="italic underline">{previewRecibo.valorPorExtenso}</span>), referente a:{' '}
                    <strong>{previewRecibo.motivo}</strong>, no período de{' '}
                    <strong>{formatDateBR(previewRecibo.periodoInicio)}</strong> até{' '}
                    <strong>{formatDateBR(previewRecibo.periodoFim)}</strong>.
                  </p>
                </div>

                {/* Discriminative Table */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Discriminação dos Dias Trabalhados
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDiariasList.map(dia => (
                      <div key={dia.id} className="p-2 rounded border border-slate-200 bg-slate-50 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span>{formatDateBR(dia.data)}</span>
                          <span className="tabular-nums">{formatBRL(dia.valorTotal)}</span>
                        </div>
                        <span className="text-[10px] text-[#707a82] block">
                          {dia.fracao === 1 ? 'Integral' : `${dia.fracao} diária`} {dia.valorAdicional > 0 ? `(+ ${formatBRL(dia.valorAdicional)})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Signature Section */}
                <div className="mt-10 pt-6 border-t border-slate-300">
                  <p className="text-right font-medium text-slate-700 mb-12">
                    {formatDateExtendedBR(previewRecibo.dataEmissao, previewRecibo.localCidade)}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                    <div className="text-center pt-8 border-t border-slate-400">
                      <p className="text-xs text-[#707a82]">Assinatura</p>
                    </div>

                    <div className="text-center pt-8 border-t border-slate-400">
                      <p className="text-xs text-[#707a82]">Assinatura</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-8 text-center">
              <FileText className="w-12 h-12 text-[#707a82] mb-3 opacity-40" />
              <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                Nenhum recibo em visualização
              </h3>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mt-1">
                Selecione o trabalhador e os dias trabalhados ao lado e clique em <strong>Gerar Recibo Oficial</strong> para visualizar o documento pronto para impressão e assinatura.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Emission History Section */}
      {recibos.length > 0 && (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none no-print">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55] mb-3">
            <h3 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0085db]" />
              Histórico de Recibos Emitidos ({recibos.length})
            </h3>
          </div>

          <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
            {recibos.map(rec => (
              <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111c2d] dark:text-white">
                      {rec.numeroRecibo}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-[#707a82] dark:text-[#7c8fac]">
                      {rec.trabalhadorNome}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#707a82] mt-0.5">
                    Emitido em {formatDateBR(rec.dataEmissao)} · Período {formatDateBR(rec.periodoInicio)} a {formatDateBR(rec.periodoFim)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(rec.valorTotal)}
                  </span>
                  <button
                    onClick={() => setPreviewRecibo(rec)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0085db] hover:bg-[#0085db]/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Visualizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
