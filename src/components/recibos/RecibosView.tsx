import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ReciboPagamento } from '../../types';
import { formatBRL, valorPorExtenso } from '../../utils/currency';
import { formatDateBR, formatDateExtendedBR, getTodayISO, getWeekRange } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  FileCheck2,
  Printer,
  Copy,
  Check,
  Calendar,
  Users2,
  FileText,
  Clock,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const RecibosView: React.FC = () => {
  const {
    trabalhadores,
    diarias,
    recibos,
    emitirRecibo,
    updateRecibo,
    deleteRecibo,
    activeObra,
    activeUser,
    showToast,
  } = useApp();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Suggested receipt number calculation
  const suggestedReciboNumero = useMemo(() => {
    return `REC-${new Date().getFullYear()}-${String(recibos.length + 1).padStart(3, '0')}`;
  }, [recibos.length]);

  // Receipt identifier / name before generating
  const [numeroReciboInput, setNumeroReciboInput] = useState<string>('');

  // Synchronize initial default receipt number if input is empty
  useEffect(() => {
    if (!numeroReciboInput) {
      setNumeroReciboInput(suggestedReciboNumero);
    }
  }, [suggestedReciboNumero]);

  // Mode for worker: manual input vs select registered worker
  const [isManualWorker, setIsManualWorker] = useState(false);
  const [selectedTrabId, setSelectedTrabId] = useState<string>(trabalhadores[0]?.id || '');
  const [manualNome, setManualNome] = useState('');
  const [manualCpf, setManualCpf] = useState('');
  const [manualFuncao, setManualFuncao] = useState('Serviços Gerais');

  // Days filtering mode: default to 'todos_abertos'
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

  // Quick edit name modal state (edit name after generating)
  const [quickEditRecibo, setQuickEditRecibo] = useState<ReciboPagamento | null>(null);
  const [quickEditNomeValue, setQuickEditNomeValue] = useState<string>('');

  // Full edit modal state (from history or preview)
  const [fullEditRecibo, setFullEditRecibo] = useState<ReciboPagamento | null>(null);
  const [fullEditForm, setFullEditForm] = useState<{
    numeroRecibo: string;
    trabalhadorNome: string;
    trabalhadorCpf: string;
    trabalhadorFuncao: string;
    responsavelNome: string;
    motivo: string;
    localCidade: string;
    dataEmissao: string;
    valorTotal: number;
    observacoes: string;
  }>({
    numeroRecibo: '',
    trabalhadorNome: '',
    trabalhadorCpf: '',
    trabalhadorFuncao: '',
    responsavelNome: '',
    motivo: '',
    localCidade: '',
    dataEmissao: getTodayISO(),
    valorTotal: 0,
    observacoes: '',
  });

  // Delete confirmation modal state
  const [deletingRecibo, setDeletingRecibo] = useState<ReciboPagamento | null>(null);
  const [restaurarDiariasOnDelete, setRestaurarDiariasOnDelete] = useState(false);

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
      list = list.filter(d => d.statusPagamento === 'pendente');
    } else if (filtroModoDias === 'trabalhador') {
      if (selectedTrabId) {
        list = list.filter(d => d.trabalhadorId === selectedTrabId);
      }
    }

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

  // Generate Receipt
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

    const nomeReciboFinal = numeroReciboInput.trim() || suggestedReciboNumero;

    const novoRecibo = emitirRecibo({
      numeroRecibo: nomeReciboFinal,
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
    // Prepare next suggested number for future receipts
    setNumeroReciboInput(`REC-${new Date().getFullYear()}-${String(recibos.length + 2).padStart(3, '0')}`);
    showToast(`Recibo "${novoRecibo.numeroRecibo}" gerado com sucesso!`, 'success');

    // Smooth scroll to preview on mobile/smaller screens
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  // Quick edit name handlers (before / after generating)
  const handleOpenQuickEditNome = (rec: ReciboPagamento) => {
    setQuickEditRecibo(rec);
    setQuickEditNomeValue(rec.numeroRecibo);
  };

  const handleSaveQuickEditNome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditRecibo) return;
    const trimmed = quickEditNomeValue.trim();
    if (!trimmed) {
      showToast('O nome do recibo não pode ficar em branco.', 'warning');
      return;
    }

    const updated: ReciboPagamento = {
      ...quickEditRecibo,
      numeroRecibo: trimmed,
    };

    updateRecibo(updated);
    if (previewRecibo?.id === updated.id) {
      setPreviewRecibo(updated);
    }
    setQuickEditRecibo(null);
    showToast(`Nome do recibo atualizado para "${trimmed}"`, 'success');
  };

  // Full Edit Modal Handlers (from history or preview)
  const handleOpenFullEdit = (rec: ReciboPagamento) => {
    setFullEditRecibo(rec);
    setFullEditForm({
      numeroRecibo: rec.numeroRecibo,
      trabalhadorNome: rec.trabalhadorNome,
      trabalhadorCpf: rec.trabalhadorCpf || '',
      trabalhadorFuncao: rec.trabalhadorFuncao || 'Serviços Gerais',
      responsavelNome: rec.responsavelNome,
      motivo: rec.motivo,
      localCidade: rec.localCidade,
      dataEmissao: rec.dataEmissao,
      valorTotal: rec.valorTotal,
      observacoes: rec.observacoes || '',
    });
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullEditRecibo) return;

    if (!fullEditForm.numeroRecibo.trim()) {
      showToast('O nome / número do recibo é obrigatório.', 'warning');
      return;
    }
    if (!fullEditForm.trabalhadorNome.trim()) {
      showToast('O nome do trabalhador / beneficiário é obrigatório.', 'warning');
      return;
    }

    const updated: ReciboPagamento = {
      ...fullEditRecibo,
      numeroRecibo: fullEditForm.numeroRecibo.trim(),
      trabalhadorNome: fullEditForm.trabalhadorNome.trim(),
      trabalhadorCpf: fullEditForm.trabalhadorCpf.trim() || 'Não informado',
      trabalhadorFuncao: fullEditForm.trabalhadorFuncao.trim() || 'Serviços Gerais',
      responsavelNome: fullEditForm.responsavelNome.trim(),
      motivo: fullEditForm.motivo.trim(),
      localCidade: fullEditForm.localCidade.trim() || 'Goiânia - GO',
      dataEmissao: fullEditForm.dataEmissao || getTodayISO(),
      valorTotal: Number(fullEditForm.valorTotal) || fullEditRecibo.valorTotal,
      valorPorExtenso: valorPorExtenso(Number(fullEditForm.valorTotal) || fullEditRecibo.valorTotal),
      observacoes: fullEditForm.observacoes.trim(),
    };

    updateRecibo(updated);
    if (previewRecibo?.id === updated.id) {
      setPreviewRecibo(updated);
    }
    setFullEditRecibo(null);
  };

  // Delete Handlers
  const handleOpenDelete = (rec: ReciboPagamento) => {
    setDeletingRecibo(rec);
    setRestaurarDiariasOnDelete(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingRecibo) return;
    deleteRecibo(deletingRecibo.id, restaurarDiariasOnDelete);
    if (previewRecibo?.id === deletingRecibo.id) {
      setPreviewRecibo(null);
    }
    setDeletingRecibo(null);
  };

  // View Handler from History
  const handleVisualizarRecibo = (rec: ReciboPagamento) => {
    setPreviewRecibo(rec);
    showToast(`Visualizando recibo ${rec.numeroRecibo}`, 'info');
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0085db]" />
            Gerador de recibos
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Emita recibos de mão de obra personalizados com dias em aberto de todos os trabalhadores
          </p>
        </div>
      </div>

      {/* Main Grid: items-stretch so both columns have matching height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Generator Form (Dados do recibo) */}
        <div className="lg:col-span-5 flex flex-col no-print">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col flex-1 justify-between gap-4 h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                <h2 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-[#0085db]" />
                  Dados do recibo
                </h2>
              </div>

              {/* Editable Name / Identification BEFORE Generating */}
              <div className="bg-[#f6f9fc] dark:bg-[#1a2535] p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0085db]" />
                    Identificação do recibo
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={numeroReciboInput}
                    onChange={e => setNumeroReciboInput(e.target.value)}
                    placeholder={`Ex: ${suggestedReciboNumero} ou Recibo Semana 44`}
                    className="w-full pl-3 pr-20 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold focus:border-[#0085db] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setNumeroReciboInput(suggestedReciboNumero)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-[#0085db] hover:bg-[#0085db]/10 rounded-lg transition-colors cursor-pointer"
                    title="Restaurar identificador sequencial padrão"
                  >
                    Padrão
                  </button>
                </div>
              </div>

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
                  </div>
                </label>
              </div>

              {/* Worker Selection (Dropdown or Manual Inputs) */}
              {!isManualWorker ? (
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                    Selecione o trabalhador
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
                          className="text-[10px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded px-1.5 py-0.5 text-[#111c2d] dark:text-white cursor-pointer"
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
                    Selecione dias trabalhados
                  </label>
                  <span className="text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 px-2 py-0.5 rounded-full">
                    {selectedDiariasIds.length} selecionado(s)
                  </span>
                </div>

                {/* Filter mode buttons */}
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

                {/* Week filter and quick selectors */}
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
                    className="px-2.5 py-1.5 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 rounded-xl border border-[#0085db]/20 hover:bg-[#0085db]/20 whitespace-nowrap cursor-pointer transition-colors"
                    title="Seleciona todas as diárias visíveis na lista abaixo"
                  >
                    Todos
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

                {/* Days Selection Checklist: dynamic height that matches receipt proportion */}
                <div className="min-h-[190px] max-h-[340px] lg:max-h-[380px] overflow-y-auto space-y-1.5 pr-1 border border-[#e6ecf1] dark:border-[#333f55] rounded-xl p-2.5 bg-[#f6f9fc] dark:bg-[#1a2535]">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            </div>

            {/* Total Callout & Submit: pinned cleanly at bottom */}
            <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] mt-auto">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-[#707a82] dark:text-[#7c8fac] font-medium">Valor total do recibo:</span>
                <span className="text-xl font-black text-[#0085db] tabular-nums">
                  {formatBRL(totalReciboCalculado)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedDiariasIds.length === 0}
                className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-[#0085db]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Gerar Recibo Oficial</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Receipt Preview */}
        <div ref={previewContainerRef} className="lg:col-span-7 flex flex-col">
          {previewRecibo ? (
            <div className="flex flex-col flex-1 h-full space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#111c2d] p-3.5 rounded-[18px] border border-[#e6ecf1] dark:border-[#333f55] no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#0085db]/10 px-2.5 py-1 rounded-xl">
                    <FileText className="w-3.5 h-3.5 text-[#0085db]" />
                    <span className="text-xs font-black text-[#0085db]">
                      {previewRecibo.numeroRecibo}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickEditNome(previewRecibo)}
                      className="p-1 text-[#0085db] hover:text-[#0071ba] hover:bg-[#0085db]/20 rounded-md transition-colors cursor-pointer"
                      title="Editar nome / identificação deste recibo"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFullEdit(previewRecibo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#333f55] text-[#111c2d] dark:text-white transition-colors cursor-pointer"
                    title="Editar todos os dados do recibo"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#0085db]" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(previewRecibo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#333f55] text-[#111c2d] dark:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#4bd08b]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-[#0085db] hover:bg-[#0071ba] text-white transition-colors shadow-sm shadow-[#0085db]/25 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Official Receipt Sheet Document (Equal height and balanced) */}
              <div
                id="receipt-print-area"
                className="bg-white text-[#111c2d] border border-slate-300 rounded-[18px] p-6 sm:p-8 shadow-sm font-sans text-xs sm:text-sm leading-relaxed flex-1 flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="text-center pb-4 border-b-2 border-[#111c2d] mb-6">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111c2d] uppercase">
                      RECIBO DE PAGAMENTO
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-[#707a82]">
                        {previewRecibo.numeroRecibo} · {activeObra.nome}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickEditNome(previewRecibo)}
                        className="text-[#0085db] hover:text-[#0071ba] text-[11px] font-semibold flex items-center gap-1 no-print p-0.5 cursor-pointer"
                        title="Editar nome / número deste recibo"
                      >
                        <Pencil className="w-3 h-3" />
                        <span className="underline">Editar nome</span>
                      </button>
                    </div>
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
                    {previewRecibo.observacoes && (
                      <p className="text-xs text-[#707a82] italic">
                        <strong>Obs:</strong> {previewRecibo.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Discriminative Table */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Discriminação dos Dias Trabalhados ({previewRecibo.diasEspecificos?.length || selectedDiariasList.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedDiariasList.length > 0 ? (
                        selectedDiariasList.map(dia => (
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
                        ))
                      ) : (
                        previewRecibo.diasEspecificos?.map((dataISO, idx) => (
                          <div key={idx} className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px]">
                            <div className="flex justify-between font-semibold">
                              <span>{formatDateBR(dataISO)}</span>
                              <span className="text-[#0085db]">Diária</span>
                            </div>
                            <div className="text-[10px] text-[#707a82] mt-0.5">
                              {previewRecibo.trabalhadorNome}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Date & Signature Section */}
                <div className="mt-8 pt-6 border-t border-slate-300">
                  <p className="text-right font-medium text-slate-700 mb-10">
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
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-8 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-[#0085db]/10 flex items-center justify-center text-[#0085db] mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                Nenhum recibo em visualização
              </h3>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mt-1.5 leading-relaxed">
                Você pode personalizar o <strong>Nome do recibo</strong> na coluna ao lado, selecionar os dias trabalhados e clicar em <strong>Gerar Recibo Oficial</strong>. Após gerar, você também poderá editar o nome ou imprimir a qualquer momento!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Emission History Section with Excluir, Editar e Visualizar */}
      {recibos.length > 0 && (
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none no-print space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55] gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0085db]" />
                Histórico de Recibos Emitidos ({recibos.length})
              </h3>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Gerencie todos os recibos emitidos: visualize no modelo oficial, edite dados ou exclua
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
            {recibos.map(rec => (
              <div key={rec.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0085db] bg-[#0085db]/10 px-2 py-0.5 rounded-lg">
                      {rec.numeroRecibo}
                    </span>
                    <span className="font-bold text-[#111c2d] dark:text-white">
                      {rec.trabalhadorNome}
                    </span>
                    {rec.trabalhadorFuncao && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#1a2535] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55]">
                        {rec.trabalhadorFuncao}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                    Emitido em <strong className="text-[#111c2d] dark:text-white">{formatDateBR(rec.dataEmissao)}</strong> · Período de {formatDateBR(rec.periodoInicio)} a {formatDateBR(rec.periodoFim)}
                  </p>
                  <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] truncate max-w-xl">
                    Motivo: {rec.motivo}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center shrink-0">
                  <span className="font-black text-sm text-[#111c2d] dark:text-white tabular-nums mr-1">
                    {formatBRL(rec.valorTotal)}
                  </span>

                  {/* 1. Visualizar */}
                  <button
                    onClick={() => handleVisualizarRecibo(rec)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 rounded-xl transition-colors cursor-pointer"
                    title="Visualizar este recibo na íntegra"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  {/* 2. Editar */}
                  <button
                    onClick={() => handleOpenFullEdit(rec)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2fa868] dark:text-[#4bd08b] bg-[#4bd08b]/10 hover:bg-[#4bd08b]/20 rounded-xl transition-colors cursor-pointer"
                    title="Editar informações deste recibo"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* 3. Excluir */}
                  <button
                    onClick={() => handleOpenDelete(rec)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#e46a76] bg-[#e46a76]/10 hover:bg-[#e46a76]/20 rounded-xl transition-colors cursor-pointer"
                    title="Excluir recibo do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK EDIT NOME MODAL (Edit name after generating) */}
      <Modal
        isOpen={!!quickEditRecibo}
        onClose={() => setQuickEditRecibo(null)}
        title="Editar Nome do Recibo"
        subtitle="Altere a identificação ou número deste recibo"
        maxWidth="md"
      >
        <form onSubmit={handleSaveQuickEditNome} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1.5">
              Nome / Identificação do Recibo *
            </label>
            <input
              type="text"
              value={quickEditNomeValue}
              onChange={e => setQuickEditNomeValue(e.target.value)}
              placeholder="Ex: REC-2026-002 ou Recibo Mão de Obra Semana 44"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-bold focus:border-[#0085db] focus:outline-none"
              autoFocus
            />
            <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-1">
              O novo nome aparecerá imediatamente no cabeçalho do recibo, na cópia de texto e na impressão oficial.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <button
              type="button"
              onClick={() => setQuickEditRecibo(null)}
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl transition-colors shadow-sm shadow-[#0085db]/25 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Nome</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* FULL EDIT MODAL (Full edit of receipt) */}
      <Modal
        isOpen={!!fullEditRecibo}
        onClose={() => setFullEditRecibo(null)}
        title="Editar Recibo de Pagamento"
        subtitle={`Recibo: ${fullEditRecibo?.numeroRecibo}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveFullEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Nome / Identificação do Recibo *
              </label>
              <input
                type="text"
                value={fullEditForm.numeroRecibo}
                onChange={e => setFullEditForm(prev => ({ ...prev, numeroRecibo: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-bold focus:border-[#0085db] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Data de Emissão *
              </label>
              <input
                type="date"
                value={fullEditForm.dataEmissao}
                onChange={e => setFullEditForm(prev => ({ ...prev, dataEmissao: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Trabalhador / Beneficiário *
              </label>
              <input
                type="text"
                value={fullEditForm.trabalhadorNome}
                onChange={e => setFullEditForm(prev => ({ ...prev, trabalhadorNome: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold focus:border-[#0085db] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                CPF do Beneficiário
              </label>
              <input
                type="text"
                value={fullEditForm.trabalhadorCpf}
                onChange={e => setFullEditForm(prev => ({ ...prev, trabalhadorCpf: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Função / Especialidade
              </label>
              <input
                type="text"
                value={fullEditForm.trabalhadorFuncao}
                onChange={e => setFullEditForm(prev => ({ ...prev, trabalhadorFuncao: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Responsável Técnico / Quem Pagou
              </label>
              <input
                type="text"
                value={fullEditForm.responsavelNome}
                onChange={e => setFullEditForm(prev => ({ ...prev, responsavelNome: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Cidade / UF
              </label>
              <input
                type="text"
                value={fullEditForm.localCidade}
                onChange={e => setFullEditForm(prev => ({ ...prev, localCidade: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Motivo do Pagamento
            </label>
            <input
              type="text"
              value={fullEditForm.motivo}
              onChange={e => setFullEditForm(prev => ({ ...prev, motivo: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={fullEditForm.valorTotal}
                onChange={e => setFullEditForm(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#0085db] focus:border-[#0085db] focus:outline-none tabular-nums"
              />
            </div>
            <div className="bg-[#f6f9fc] dark:bg-[#1a2535] p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55]">
              <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block">Valor por Extenso Automático:</span>
              <span className="text-xs font-semibold text-[#111c2d] dark:text-white italic">
                {valorPorExtenso(fullEditForm.valorTotal)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Observações Adicionais (opcional)
            </label>
            <input
              type="text"
              value={fullEditForm.observacoes}
              onChange={e => setFullEditForm(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Notas ou detalhes contratuais..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <button
              type="button"
              onClick={() => setFullEditRecibo(null)}
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl transition-colors shadow-sm shadow-[#0085db]/25 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingRecibo}
        onClose={() => setDeletingRecibo(null)}
        title="Excluir Recibo"
        subtitle={`Confirmação de exclusão do recibo ${deletingRecibo?.numeroRecibo}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#e46a76]/10 border border-[#e46a76]/20 text-[#e46a76]">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Atenção ao excluir o recibo:</p>
              <p className="text-[#111c2d] dark:text-[#e6ecf1]">
                O recibo <strong>{deletingRecibo?.numeroRecibo}</strong> de <strong>{deletingRecibo?.trabalhadorNome}</strong> no valor de <strong>{deletingRecibo ? formatBRL(deletingRecibo.valorTotal) : ''}</strong> será removido do histórico.
              </p>
            </div>
          </div>

          {deletingRecibo?.diariasIds && deletingRecibo.diariasIds.length > 0 && (
            <label className="flex items-center gap-2 p-3 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={restaurarDiariasOnDelete}
                onChange={e => setRestaurarDiariasOnDelete(e.target.checked)}
                className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] cursor-pointer"
              />
              <span className="font-medium text-[#111c2d] dark:text-white">
                Reabrir as {deletingRecibo.diariasIds.length} diárias vinculadas a este recibo (status voltará para "Em Aberto")
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <button
              type="button"
              onClick={() => setDeletingRecibo(null)}
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-[#e46a76] hover:bg-[#d45663] rounded-xl transition-colors shadow-sm shadow-[#e46a76]/25 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Recibo</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
