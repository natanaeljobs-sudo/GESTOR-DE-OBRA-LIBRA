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
  UserCheck,
  Pencil,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const RecibosView: React.FC = () => {
  const {
    trabalhadores,
    diarias,
    recibos,
    emitirRecibo,
    activeObra,
    activeUser,
    showToast,
  } = useApp();

  // Mode for worker: manual input vs select registered worker
  const [isManualWorker, setIsManualWorker] = useState(false);
  const [selectedTrabId, setSelectedTrabId] = useState<string>(trabalhadores[0]?.id || '');
  const [manualNome, setManualNome] = useState('');
  const [manualCpf, setManualCpf] = useState('');
  const [manualFuncao, setManualFuncao] = useState('Serviços Gerais');

  // Days filtering mode: default to 'todos_abertos' as requested by user
  const [filtroModoDias, setFiltroModoDias] = useState<'todos_abertos' | 'trabalhador' | 'todas'>('todos_abertos');
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('all');
  const [selectedDiariasIds, setSelectedDiariasIds] = useState<string[]>([]);

  // Receipt meta
  const [motivo, setMotivo] = useState(`Pagamento referente a serviços de mão de obra prestados na ${activeObra.nome}`);
  const [responsavelNome, setResponsavelNome] = useState(`${activeUser.nome} (Responsável Técnico / Obra)`);
  const [localCidade, setLocalCidade] = useState('Goiânia - GO');
  const [marcarComoPagas, setMarcarComoPagas] = useState(true);

  // Preview & feedback
  const [previewRecibo, setPreviewRecibo] = useState<ReciboPagamento | null>(null);
  const [copied, setCopied] = useState(false);

  // Selected registered worker object
  const currentWorker = useMemo(() => {
    return trabalhadores.find(t => t.id === selectedTrabId);
  }, [trabalhadores, selectedTrabId]);

  // Count of pending (open) diarias
  const countDiasAbertos = useMemo(() => {
    return diarias.filter(d => d.statusPagamento === 'pendente').length;
  }, [diarias]);

  // Diarias list depending on filter mode
  const diasDisponiveis = useMemo(() => {
    let list = [...diarias];

    if (filtroModoDias === 'todos_abertos') {
      // Shows all open days across all workers
      list = list.filter(d => d.statusPagamento === 'pendente');
    } else if (filtroModoDias === 'trabalhador') {
      // If worker selected, show that worker's days
      if (selectedTrabId) {
        list = list.filter(d => d.trabalhadorId === selectedTrabId);
      }
    }
    // 'todas' mode shows all without status filter

    return list.sort((a, b) => b.data.localeCompare(a.data));
  }, [diarias, filtroModoDias, selectedTrabId]);

  // Weeks available in currently filtered list
  const availableWeeks = useMemo(() => {
    const weeks: Record<string, { label: string; start: string; end: string; count: number }> = {};
    diasDisponiveis.forEach(d => {
      const range = getWeekRange(d.data);
      const key = `${range.segunda}_${range.domingo}`;
      if (!weeks[key]) {
        weeks[key] = { label: range.label, start: range.segunda, end: range.domingo, count: 0 };
      }
      weeks[key].count++;
    });
    return weeks;
  }, [diasDisponiveis]);

  // Final filtered list based on week selection
  const filteredDiarias = useMemo(() => {
    if (selectedWeekKey === 'all') return diasDisponiveis;
    const [start, end] = selectedWeekKey.split('_');
    return diasDisponiveis.filter(d => d.data >= start && d.data <= end);
  }, [diasDisponiveis, selectedWeekKey]);

  const toggleDiariaSelection = (id: string) => {
    setSelectedDiariasIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredDiarias.map(d => d.id);
    setSelectedDiariasIds(prev => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleClearSelection = () => {
    setSelectedDiariasIds([]);
  };

  const handleSelectOnlyPending = () => {
    setFiltroModoDias('todos_abertos');
    const pendingIds = diarias.filter(d => d.statusPagamento === 'pendente').map(d => d.id);
    setSelectedDiariasIds(pendingIds);
  };

  const selectedDiariasList = useMemo(() => {
    return diarias.filter(d => selectedDiariasIds.includes(d.id));
  }, [diarias, selectedDiariasIds]);

  const totalReciboCalculado = useMemo(() => {
    return selectedDiariasList.reduce((sum, d) => sum + d.valorTotal, 0);
  }, [selectedDiariasList]);

  // Quick helper to fill manual inputs from a worker
  const handleFillFromTrab = (trab: typeof trabalhadores[0]) => {
    setManualNome(trab.nome);
    setManualCpf(trab.cpf || '');
    setManualFuncao(trab.funcao || 'Serviços Gerais');
  };

  const handleGenerate = () => {
    if (selectedDiariasIds.length === 0) {
      showToast('Selecione ao menos um dia trabalhado para emitir o recibo.', 'warning');
      return;
    }

    if (isManualWorker) {
      if (!manualNome.trim()) {
        showToast('Por favor, informe o nome do trabalhador.', 'warning');
        return;
      }
    } else {
      if (!selectedTrabId && !currentWorker) {
        showToast('Selecione um trabalhador da lista ou ative a opção de digitar manualmente.', 'warning');
        return;
      }
    }

    const dates = selectedDiariasList.map(d => d.data).sort();
    const startDate = dates[0] || getTodayISO();
    const endDate = dates[dates.length - 1] || getTodayISO();

    const novoRecibo = emitirRecibo({
      trabalhadorId: isManualWorker ? undefined : selectedTrabId,
      trabalhadorManual: isManualWorker
        ? {
            nome: manualNome.trim(),
            cpf: manualCpf.trim() || 'Não informado',
            funcao: manualFuncao.trim() || 'Serviços Gerais',
          }
        : undefined,
      diariasIds: selectedDiariasIds,
      periodoInicio: startDate,
      periodoFim: endDate,
      motivo,
      responsavelNome,
      localCidade,
      marcarComoPagas,
    });

    setPreviewRecibo(novoRecibo);
    showToast(`Recibo ${novoRecibo.numeroRecibo} gerado com sucesso!`, 'success');
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

BENEFICIÁRIO: ${rec.trabalhadorNome}
CPF: ${rec.trabalhadorCpf}
FUNÇÃO: ${rec.trabalhadorFuncao}

REFERENTE A:
${rec.motivo}
Período: ${formatDateBR(rec.periodoInicio)} a ${formatDateBR(rec.periodoFim)}

${rec.localCidade}, ${formatDateBR(rec.dataEmissao)}

_________________________________________
Assinatura do Recebedor: ${rec.trabalhadorNome}
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
            Gerador de recibos
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Emita recibos oficiais de mão de obra com dias em aberto de todos os trabalhadores ou digitação manual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
            <h2 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2 pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <Users2 className="w-4 h-4 text-[#0085db]" />
              1. Identificação do Trabalhador
            </h2>

            {/* Checkbox option to toggle manual typing vs selecting worker */}
            <div className="bg-[#f6f9fc] dark:bg-[#1a2535] p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] transition-all">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManualWorker}
                  onChange={e => {
                    const checked = e.target.checked;
                    setIsManualWorker(checked);
                    if (checked && currentWorker && !manualNome) {
                      setManualNome(currentWorker.nome);
                      setManualCpf(currentWorker.cpf || '');
                      setManualFuncao(currentWorker.funcao || 'Serviços Gerais');
                    }
                  }}
                  className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5 text-[#0085db]" />
                    Digitar trabalhador manualmente
                  </span>
                  <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac] block">
                    Marque para digitar nome, CPF e função sem precisar selecionar do cadastro.
                  </span>
                </div>
              </label>
            </div>

            {/* Worker Selection (Dropdown or Manual Inputs) */}
            {!isManualWorker ? (
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                  Selecionar Trabalhador Cadastrado
                </label>
                <select
                  value={selectedTrabId}
                  onChange={e => {
                    setSelectedTrabId(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold focus:border-[#0085db] focus:outline-none"
                >
                  <option value="">-- Selecione o trabalhador --</option>
                  {trabalhadores.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.funcao} · CPF: {t.cpf || 'Não cadastrado'})
                    </option>
                  ))}
                </select>
                {currentWorker && (
                  <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#4bd08b]" />
                    {currentWorker.funcao} · CPF: {currentWorker.cpf || 'Não cadastrado'} · Diária Base: {formatBRL(currentWorker.valorDiariaPadrao)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl border border-[#0085db]/25 bg-[#0085db]/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0085db] uppercase tracking-wider">
                    Dados Manuais do Trabalhador
                  </span>
                  {trabalhadores.length > 0 && (
                    <div className="text-[10px]">
                      <span className="text-[#707a82] mr-1">Preencher com:</span>
                      <select
                        onChange={e => {
                          const trab = trabalhadores.find(t => t.id === e.target.value);
                          if (trab) handleFillFromTrab(trab);
                        }}
                        defaultValue=""
                        className="text-[10px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded px-1.5 py-0.5 text-[#111c2d] dark:text-white"
                      >
                        <option value="" disabled>
                          Copiar de...
                        </option>
                        {trabalhadores.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Nome Completo do Trabalhador / Beneficiário *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: José Carlos de Oliveira"
                    value={manualNome}
                    onChange={e => setManualNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold focus:border-[#0085db] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                      CPF (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={manualCpf}
                      onChange={e => setManualCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                      Função / Especialidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pedreiro, Carpinteiro"
                      value={manualFuncao}
                      onChange={e => setManualFuncao(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Days Section Header & Filter Modes */}
            <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0085db]" />
                  2. Selecionar Dias Trabalhados
                </label>
                <span className="text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 px-2 py-0.5 rounded-full">
                  {selectedDiariasIds.length} selecionado(s)
                </span>
              </div>

              {/* View options pills: Default is all open days */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFiltroModoDias('todos_abertos')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    filtroModoDias === 'todos_abertos'
                      ? 'bg-[#0085db] text-white shadow-sm'
                      : 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white border border-[#e6ecf1] dark:border-[#333f55]'
                  }`}
                >
                  Todos em Aberto ({countDiasAbertos})
                </button>

                {!isManualWorker && selectedTrabId && (
                  <button
                    type="button"
                    onClick={() => setFiltroModoDias('trabalhador')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      filtroModoDias === 'trabalhador'
                        ? 'bg-[#0085db] text-white shadow-sm'
                        : 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white border border-[#e6ecf1] dark:border-[#333f55]'
                    }`}
                  >
                    Apenas deste Trabalhador
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFiltroModoDias('todas')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    filtroModoDias === 'todas'
                      ? 'bg-[#0085db] text-white shadow-sm'
                      : 'bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white border border-[#e6ecf1] dark:border-[#333f55]'
                  }`}
                >
                  Todas ({diarias.length})
                </button>
              </div>

              {/* Week filter and fast selectors */}
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={selectedWeekKey}
                  onChange={e => setSelectedWeekKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                >
                  <option value="all">Todas as semanas ({diasDisponiveis.length} diárias)</option>
                  {Object.entries(availableWeeks).map(([key, w]) => (
                    <option key={key} value={key}>
                      Semana: {w.label} ({w.count} diárias)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 rounded-xl border border-[#0085db]/20 hover:bg-[#0085db]/20 whitespace-nowrap cursor-pointer"
                  title="Seleciona todas as diárias visíveis na lista abaixo"
                >
                  Marcar Visíveis
                </button>

                {selectedDiariasIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-[#e46a76] hover:bg-[#e46a76]/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Days Selection Checklist */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-[#e6ecf1] dark:border-[#333f55] rounded-xl p-2.5 bg-[#f6f9fc] dark:bg-[#1a2535]">
                {filteredDiarias.length === 0 ? (
                  <div className="text-center py-6 px-3">
                    <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                      {filtroModoDias === 'todos_abertos'
                        ? 'Nenhuma diária em aberto no momento. Todas as diárias estão pagas!'
                        : 'Nenhuma diária encontrada com os filtros selecionados.'}
                    </p>
                    {filtroModoDias === 'todos_abertos' && diarias.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFiltroModoDias('todas')}
                        className="mt-2 text-[11px] font-bold text-[#0085db] hover:underline cursor-pointer"
                      >
                        Ver todas as diárias (incluindo pagas)
                      </button>
                    )}
                  </div>
                ) : (
                  filteredDiarias.map(dia => {
                    const isSelected = selectedDiariasIds.includes(dia.id);
                    const isPending = dia.statusPagamento === 'pendente';

                    return (
                      <label
                        key={dia.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-[#0085db]/10 border-[#0085db]/40 text-[#0085db]'
                            : 'bg-white dark:bg-[#111c2d] border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-[#7c8fac] hover:border-[#0085db]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDiariaSelection(dia.id)}
                            className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#111c2d] dark:text-white truncate">
                                {dia.trabalhadorNome}
                              </span>
                              <span className="text-[10px] text-[#707a82]">·</span>
                              <span className="font-semibold text-[#0085db]">
                                {formatDateBR(dia.data)}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#707a82] block truncate">
                              {dia.fracao === 1 ? 'Integral' : `${dia.fracao} diária`}
                              {dia.valorAdicional > 0 ? ` (+ ${formatBRL(dia.valorAdicional)})` : ''}
                              {dia.descricaoAdicional ? ` - ${dia.descricaoAdicional}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold tabular-nums text-xs text-[#111c2d] dark:text-white block">
                            {formatBRL(dia.valorTotal)}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isPending
                                ? 'bg-[#f8c076]/20 text-[#d88924] dark:text-[#f8c076]'
                                : 'bg-[#4bd08b]/20 text-[#2fa868] dark:text-[#4bd08b]'
                            }`}
                          >
                            {isPending ? 'Em Aberto' : 'Pago'}
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={marcarComoPagas}
                  onChange={e => setMarcarComoPagas(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer"
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white">
                    Recibo #{previewRecibo.numeroRecibo}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#4bd08b]/15 text-[#4bd08b] font-bold">
                    {previewRecibo.trabalhadorNome}
                  </span>
                </div>
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

                {/* Beneficiary Badge */}
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="text-[#707a82] font-semibold">Beneficiário: </span>
                    <strong className="text-[#111c2d]">{previewRecibo.trabalhadorNome}</strong>
                  </div>
                  <div>
                    <span className="text-[#707a82] font-semibold">Função: </span>
                    <strong className="text-[#111c2d]">{previewRecibo.trabalhadorFuncao || 'Serviços Gerais'}</strong>
                  </div>
                  <div>
                    <span className="text-[#707a82] font-semibold">CPF: </span>
                    <strong className="text-[#111c2d]">{previewRecibo.trabalhadorCpf || 'Não informado'}</strong>
                  </div>
                </div>

                {/* Legal body prose */}
                <div className="space-y-4 text-justify">
                  <p>
                    Recebi(emos) de <strong>{previewRecibo.responsavelNome}</strong> a importância líquida de{' '}
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
                    Discriminação dos Dias Trabalhados ({selectedDiariasList.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDiariasList.map(dia => (
                      <div key={dia.id} className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span>{formatDateBR(dia.data)}</span>
                          <span className="tabular-nums font-bold text-[#0085db]">{formatBRL(dia.valorTotal)}</span>
                        </div>
                        <div className="text-[10px] text-[#707a82] mt-0.5 flex justify-between">
                          <span className="truncate max-w-[120px] font-medium">{dia.trabalhadorNome}</span>
                          <span>{dia.fracao === 1 ? 'Integral' : `${dia.fracao} d.`}</span>
                        </div>
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
                      <p className="font-bold text-slate-800">{previewRecibo.responsavelNome}</p>
                      <p className="text-xs text-[#707a82]">Responsável Técnico / Pagador</p>
                    </div>

                    <div className="text-center pt-8 border-t border-slate-400">
                      <p className="font-bold text-slate-800">{previewRecibo.trabalhadorNome}</p>
                      <p className="text-xs text-[#707a82]">
                        CPF: {previewRecibo.trabalhadorCpf || 'Não informado'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assinatura do Recebedor</p>
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
                Selecione os dias em aberto na lista ao lado (de todos os trabalhadores ou filtrado) ou informe os dados manualmente e clique em <strong>Gerar Recibo Oficial</strong>.
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
                    {rec.trabalhadorFuncao && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82]">
                        {rec.trabalhadorFuncao}
                      </span>
                    )}
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
