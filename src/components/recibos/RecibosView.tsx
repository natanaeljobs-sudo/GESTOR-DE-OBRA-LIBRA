import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ReciboPagamento } from '../../types';
import { formatBRL, valorPorExtenso } from '../../utils/currency';
import { formatDateBR, getTodayISO, getWeekRange } from '../../utils/date';
import { Modal } from '../common/Modal';
import { ReciboPreviewModal } from './ReciboPreviewModal';
import { triggerReciboInPagePrint } from '../../utils/reciboPrintService';
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
  Search,
  X as XIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
  const [motivo, setMotivo] = useState(`Pagamento referente a serviços de mão de obra prestados na ${activeObra?.nome || 'Obra'}`);
  const [responsavelNome, setResponsavelNome] = useState(`${activeUser?.nome || 'Responsável'} (Responsável Técnico / Obra)`);
  const [localCidade, setLocalCidade] = useState('Goiânia - GO');
  const [marcarComoPagas, setMarcarComoPagas] = useState(true);

  // Preview & feedback
  const [previewRecibo, setPreviewRecibo] = useState<ReciboPagamento | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Recibos History Table Search & Filters
  const [reciboSearchTerm, setReciboSearchTerm] = useState('');
  const [reciboWorkerFilter, setReciboWorkerFilter] = useState<string>('all');

  // Pagination state (matching RelatoriosView)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Count & value of pending (open) diarias
  const countDiasAbertos = useMemo(() => {
    return diarias.filter(d => d.statusPagamento === 'pendente').length;
  }, [diarias]);

  const valorDiasAbertos = useMemo(() => {
    return diarias
      .filter(d => d.statusPagamento === 'pendente')
      .reduce((sum, d) => sum + d.valorTotal, 0);
  }, [diarias]);

  // Total value of all issued receipts
  const totalEmitido = useMemo(() => {
    return recibos.reduce((sum, r) => sum + r.valorTotal, 0);
  }, [recibos]);

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

  const handlePrint = async (rec?: ReciboPagamento) => {
    const targetRecibo = rec || previewRecibo;
    if (!targetRecibo) {
      showToast('Nenhum recibo disponível para impressão.', 'warning');
      return;
    }
    setIsPrinting(true);
    try {
      const ok = await triggerReciboInPagePrint(targetRecibo, activeObra?.nome || 'Obra');
      if (ok) {
        showToast(`Janela de impressão gerada para ${targetRecibo.numeroRecibo}!`, 'success');
      }
    } catch (err) {
      console.warn('Erro ao acionar impressão:', err);
      showToast('Erro ao preparar impressão do recibo.', 'warning');
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

  const getFormattedCityDate = (dataISO: string, cidade: string) => {
    try {
      const d = new Date(`${dataISO}T12:00:00`);
      const meses = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const dia = d.getDate();
      const mes = meses[d.getMonth()];
      const ano = d.getFullYear();
      return `${cidade.toUpperCase()}, ${dia} de ${mes} de ${ano}`;
    } catch {
      return `${cidade.toUpperCase()}, ${dataISO}`;
    }
  };

  const handleCopyText = (rec: ReciboPagamento) => {
    const cpfSnippet = rec.trabalhadorCpf && rec.trabalhadorCpf !== 'Não informado'
      ? `, portador(a) do CPF Nº ${rec.trabalhadorCpf}`
      : '';
    const text = `
RECIBO DE PAGAMENTO (2 VIAS EM FOLHA A4)
Nº ${rec.numeroRecibo} · ${activeObra?.nome || 'Obra'}

Eu, ${rec.trabalhadorNome}${cpfSnippet} recebi de ${rec.responsavelNome}, a importância de ${formatBRL(rec.valorTotal)} (${rec.valorPorExtenso}) referente à (${rec.motivo}).

${getFormattedCityDate(rec.dataEmissao, rec.localCidade)}

_____________________________________________________
${rec.trabalhadorNome.toUpperCase()}
Assinatura do Recebedor
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

  // Distinct workers list for history dropdown filter
  const reciboWorkerOptions = useMemo(() => {
    const names = new Set<string>();
    recibos.forEach(r => {
      if (r.trabalhadorNome) names.add(r.trabalhadorNome);
    });
    return Array.from(names).sort();
  }, [recibos]);

  // Filtered recibos for the table
  const filteredRecibos = useMemo(() => {
    return recibos.filter(rec => {
      const term = reciboSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        rec.numeroRecibo.toLowerCase().includes(term) ||
        rec.trabalhadorNome.toLowerCase().includes(term) ||
        (rec.trabalhadorCpf && rec.trabalhadorCpf.toLowerCase().includes(term)) ||
        (rec.motivo && rec.motivo.toLowerCase().includes(term));

      const matchesWorker =
        reciboWorkerFilter === 'all' ||
        rec.trabalhadorNome.toLowerCase() === reciboWorkerFilter.toLowerCase() ||
        (rec.trabalhadorId && rec.trabalhadorId === reciboWorkerFilter);

      return matchesSearch && matchesWorker;
    });
  }, [recibos, reciboSearchTerm, reciboWorkerFilter]);

  // Pagination calculation (matching RelatoriosView)
  const totalItems = filteredRecibos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedRecibos = filteredRecibos.slice(startIndex, startIndex + itemsPerPage);

  const paginationConfig = useMemo(() => {
    if (totalPages <= 4) {
      return {
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
        hasPrevEllipsis: false,
        hasNextEllipsis: false,
      };
    }

    if (validCurrentPage <= 3) {
      return {
        pages: [1, 2, 3],
        hasPrevEllipsis: false,
        hasNextEllipsis: true,
      };
    }

    if (validCurrentPage >= totalPages - 2) {
      return {
        pages: [totalPages - 2, totalPages - 1, totalPages],
        hasPrevEllipsis: true,
        hasNextEllipsis: false,
      };
    }

    return {
      pages: [validCurrentPage - 1, validCurrentPage, validCurrentPage + 1],
      hasPrevEllipsis: true,
      hasNextEllipsis: true,
    };
  }, [totalPages, validCurrentPage]);

  // Export CSV (matching RelatoriosView button style and behavior)
  const handleExportCSV = () => {
    const rows = [
      ['Numero Recibo', 'Data Emissao', 'Trabalhador', 'CPF', 'Funcao', 'Periodo Inicio', 'Periodo Fim', 'Motivo', 'Responsavel', 'Valor (R$)'],
      ...filteredRecibos.map(r => [
        `"${r.numeroRecibo.replace(/"/g, '""')}"`,
        r.dataEmissao,
        `"${r.trabalhadorNome.replace(/"/g, '""')}"`,
        `"${(r.trabalhadorCpf || '').replace(/"/g, '""')}"`,
        `"${(r.trabalhadorFuncao || '').replace(/"/g, '""')}"`,
        r.periodoInicio,
        r.periodoFim,
        `"${r.motivo.replace(/"/g, '""')}"`,
        `"${r.responsavelNome.replace(/"/g, '""')}"`,
        r.valorTotal.toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recibos_${activeObra?.id || 'obra'}_${getTodayISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Handler from History
  const handleVisualizarRecibo = (rec: ReciboPagamento) => {
    setPreviewRecibo(rec);
    showToast(`Visualizando recibo ${rec.numeroRecibo}`, 'info');
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to render one full autonomous via of the receipt matching the user's PDF reference
  const renderReceiptVia = (rec: ReciboPagamento, viaNumber: 1 | 2, viaLabel: string) => {
    const cpfFormatted = rec.trabalhadorCpf && rec.trabalhadorCpf !== 'Não informado' ? rec.trabalhadorCpf : '';

    return (
      <div
        key={viaNumber}
        className="recibo-via-block flex flex-col justify-between p-4 sm:p-6 bg-white text-[#111c2d] rounded-xl border border-slate-200/90 print:border-none print:p-0 print:rounded-none"
      >
        <div>
          {/* Header metadata row */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#0085db] text-xs">
                {rec.numeroRecibo}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-semibold text-slate-700 text-xs truncate max-w-[220px]">
                {activeObra?.nome || 'Obra'}
              </span>
              {viaNumber === 1 && (
                <button
                  type="button"
                  onClick={() => handleOpenQuickEditNome(rec)}
                  className="text-[#0085db] hover:text-[#0071ba] text-[11px] font-semibold flex items-center gap-1 no-print ml-1 p-0.5 cursor-pointer"
                  title="Editar nome / identificação deste recibo"
                >
                  <Pencil className="w-3 h-3" />
                  <span className="underline">Editar nome</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {viaLabel}
              </span>
            </div>
          </div>

          {/* Title matching user reference */}
          <div className="text-center my-3 sm:my-4">
            <h2 className="text-base sm:text-lg font-black tracking-wider text-[#111c2d] uppercase">
              RECIBO DE PAGAMENTO
            </h2>
          </div>

          {/* Reference Body Text */}
          <div className="my-4 sm:my-5 text-justify text-xs sm:text-sm leading-relaxed text-[#111c2d]">
            <p>
              Eu, <strong className="uppercase">{rec.trabalhadorNome}</strong>
              {cpfFormatted ? (
                <>, portador do CPF Nº <strong>{cpfFormatted}</strong></>
              ) : ''} recebi de <strong className="uppercase">{rec.responsavelNome}</strong>, a importância de{' '}
              <strong className="text-[#111c2d] tabular-nums">{formatBRL(rec.valorTotal)}</strong>{' '}
              ({rec.valorPorExtenso}) referente à ({rec.motivo}).
            </p>
            {rec.observacoes && (
              <p className="text-[11px] text-[#707a82] italic mt-2">
                <strong>Obs:</strong> {rec.observacoes}
              </p>
            )}
          </div>
        </div>

        {/* Date and Signature Area */}
        <div className="mt-4 pt-2">
          <p className="text-right text-xs sm:text-sm font-semibold text-[#111c2d] mb-8 sm:mb-10">
            {getFormattedCityDate(rec.dataEmissao, rec.localCidade)}
          </p>

          <div className="max-w-md mx-auto text-center">
            <div className="border-t border-slate-900 w-full mb-1.5" />
            <p className="font-bold text-xs sm:text-sm text-[#111c2d] uppercase tracking-wide">
              {rec.trabalhadorNome}
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
    <>
      {/* =========================================================================
          SCREEN VIEW (Hidden during print - matching RelatoriosView structure)
      ========================================================================= */}
      <div className="space-y-5 pb-20 lg:pb-8 animate-in fade-in duration-150 print:hidden">

        {/* Top Header - Standardized with Relatórios */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
              Recibos de Pagamento
            </h1>
            <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
              {activeObra?.nome || 'Obra Juscelino Mola'} · Emissão e controle de recibos de mão de obra
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export CSV button - matching RelatoriosView */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] hover:border-[#0085db]/40 hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d42] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#707a82] dark:text-[#7c8fac]" />
              <span>Exportar CSV</span>
            </button>

            {/* Imprimir button - matching RelatoriosView */}
            <button
              onClick={() => {
                if (!previewRecibo) {
                  showToast('Selecione ou gere um recibo para visualizar e imprimir.', 'warning');
                  return;
                }
                setIsPreviewModalOpen(true);
              }}
              disabled={!previewRecibo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
              title="Abrir pré-visualização oficial do recibo para conferência e impressão"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Grid - Matching Relatórios 1:1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: TOTAL EMITIDO */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              TOTAL EMITIDO
            </span>
            <div className="mt-3 flex items-baseline justify-center gap-1.5">
              <span className="text-sm font-bold text-[#0085db]">R$</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0085db] tabular-nums tracking-tight">
                {formatBRL(totalEmitido).replace('R$', '').trim()}
              </span>
            </div>
          </div>

          {/* Card 2: RECIBOS EMITIDOS */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              RECIBOS EMITIDOS
            </span>
            <div className="mt-3 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight block text-center">
                {recibos.length}
              </span>
            </div>
          </div>

          {/* Card 3: DIÁRIAS EM ABERTO */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              DIÁRIAS EM ABERTO
            </span>
            <div className="mt-3 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-[#111c2d] dark:text-white tracking-tight block text-center">
                {countDiasAbertos > 0
                  ? `${countDiasAbertos} ${countDiasAbertos === 1 ? 'diária' : 'diárias'} · ${formatBRL(valorDiasAbertos)}`
                  : 'Nenhuma pendente'}
              </span>
            </div>
          </div>

        </div>

        {/* Filter Controls Row - Matching Relatórios */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Mode Selector Buttons */}
          <button
            type="button"
            onClick={() => setFiltroModoDias('todos_abertos')}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
              filtroModoDias === 'todos_abertos'
                ? 'bg-[#0085db] text-white border border-[#0085db] shadow-sm shadow-[#0085db]/25'
                : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:border-[#0085db]/40 shadow-xs'
            }`}
          >
            <span>Em Aberto ({countDiasAbertos})</span>
          </button>

          {!isManualWorker && selectedTrabId && (
            <button
              type="button"
              onClick={() => setFiltroModoDias('trabalhador')}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
                filtroModoDias === 'trabalhador'
                  ? 'bg-[#0085db] text-white border border-[#0085db] shadow-sm shadow-[#0085db]/25'
                  : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:border-[#0085db]/40 shadow-xs'
              }`}
            >
              <span>Apenas do Trabalhador</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFiltroModoDias('todas')}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer select-none ${
              filtroModoDias === 'todas'
                ? 'bg-[#0085db] text-white border border-[#0085db] shadow-sm shadow-[#0085db]/25'
                : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:border-[#0085db]/40 shadow-xs'
            }`}
          >
            <span>Todas as Diárias ({diarias.length})</span>
          </button>

          {/* Week Filter Selector */}
          <div className="relative">
            <select
              value={selectedWeekKey}
              onChange={e => setSelectedWeekKey(e.target.value)}
              className="inline-flex items-center gap-1.5 px-3 py-2 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white shadow-xs hover:border-[#0085db]/40 active:scale-95 transition-all cursor-pointer select-none whitespace-nowrap"
            >
              <option value="all">Todas as semanas ({diasDisponiveis.length} diárias)</option>
              {Object.entries(availableWeeks).map(([key, w]) => (
                <option key={key} value={key}>
                  Semana: {w.label} ({w.count} diárias)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Grid: Form (Left) & Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch recibos-grid-container">
          
          {/* Left Column: Generator Form (Dados do recibo) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-xs flex flex-col flex-1 justify-between gap-4 h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6ecf1] dark:border-[#333f55]">
                  <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
                    Dados do recibo
                  </h2>
                  <span className="text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 px-2.5 py-0.5 rounded-full">
                    {selectedDiariasIds.length} selecionada(s)
                  </span>
                </div>

                {/* Editable Name / Identification BEFORE Generating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111c2d] dark:text-white block">
                    Identificação do recibo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={numeroReciboInput}
                      onChange={e => setNumeroReciboInput(e.target.value)}
                      placeholder={`Ex: ${suggestedReciboNumero} ou Recibo Semana 44`}
                      className="w-full pl-3 pr-20 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-[#0085db] transition-colors"
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
                <div className="bg-[#f6f9fc] dark:bg-[#162232] p-3 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] transition-all">
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
                      onChange={e => setSelectedTrabId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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
                          <span className="text-[#707a82] dark:text-[#7c8fac] mr-1">Preencher com:</span>
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Days Section Header & Quick Selectors */}
                <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0085db]" />
                      Selecione dias trabalhados
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllVisible}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 rounded-lg border border-[#0085db]/20 hover:bg-[#0085db]/20 whitespace-nowrap cursor-pointer transition-colors"
                        title="Seleciona todas as diárias visíveis"
                      >
                        Selecionar Todos
                      </button>

                      {selectedDiariasIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="px-2 py-1 text-[11px] font-bold text-[#e46a76] hover:bg-[#e46a76]/10 rounded-lg transition-colors cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Days Selection Checklist */}
                  <div className="min-h-[190px] max-h-[340px] lg:max-h-[380px] overflow-y-auto space-y-1.5 pr-1 border border-[#e6ecf1] dark:border-[#333f55] rounded-xl p-2.5 bg-[#f6f9fc] dark:bg-[#162232]">
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
                                  <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac]">·</span>
                                  <span className="font-semibold text-[#0085db]">
                                    {formatDateBR(dia.data)}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block truncate">
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
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

              {/* Total Callout & Submit */}
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
                  className="w-full py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-[#0085db]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Gerar Recibo Oficial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Receipt Preview */}
          <div ref={previewContainerRef} className="lg:col-span-7 flex flex-col recibos-preview-column">
            {previewRecibo ? (
              <div className="flex flex-col flex-1 h-full space-y-3">
                {/* Preview Card Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#111c2d] p-3.5 rounded-[18px] border border-[#e6ecf1] dark:border-[#333f55] shadow-xs no-print">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#e6ecf1] dark:hover:bg-[#1f2d42] text-[#111c2d] dark:text-white transition-colors cursor-pointer"
                      title="Editar todos os dados do recibo"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#0085db]" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(previewRecibo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f6f9fc] dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#e6ecf1] dark:hover:bg-[#1f2d42] text-[#111c2d] dark:text-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#4bd08b]" /> : <Copy className="w-3.5 h-3.5 text-[#707a82] dark:text-[#7c8fac]" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!previewRecibo) {
                          showToast('Nenhum recibo disponível para impressão.', 'warning');
                          return;
                        }
                        setIsPreviewModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
                      title="Abrir pré-visualização oficial do recibo para conferência e impressão"
                    >
                      <Printer className="w-4 h-4 shrink-0" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Official Receipt Sheet Document (2 Vias em 1 Folha A4 com corte central) */}
                <div
                  id="receipt-print-area"
                  className="bg-white text-[#111c2d] border border-slate-300 rounded-[18px] p-4 sm:p-6 shadow-sm font-sans flex-1 flex flex-col justify-between"
                >
                  {/* 1ª Via (Metade Superior) */}
                  {renderReceiptVia(previewRecibo, 1, '1ª Via · Pagador')}

                  {/* Linha de corte horizontal discreta para separar as vias ao meio */}
                  <div className="recibo-cut-line relative my-2 sm:my-3 py-1 flex items-center justify-center select-none">
                    <div className="w-full border-t border-dashed border-zinc-400" />
                    <span className="absolute bg-white px-3 text-[10px] font-bold text-zinc-500 tracking-wider flex items-center gap-1.5 uppercase">
                      ✂ <span>Linha de corte · Separar as 2 vias</span> ✂
                    </span>
                  </div>

                  {/* 2ª Via (Metade Inferior) */}
                  {renderReceiptVia(previewRecibo, 2, '2ª Via · Recebedor')}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-8 text-center no-print shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#0085db]/10 flex items-center justify-center text-[#0085db] mb-4">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#111c2d] dark:text-white">
                  Nenhum recibo em visualização
                </h3>
                <p className="text-xs text-[#707a82] dark:text-[#7c8fac] max-w-sm mt-1.5 leading-relaxed">
                  Personalize a <strong>Identificação do recibo</strong> na coluna ao lado, selecione os dias trabalhados e clique em <strong>Gerar Recibo Oficial</strong>. Ou escolha um recibo existente no histórico abaixo para visualizar e imprimir!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card: Histórico de Recibos Emitidos (Standardized 1:1 with Relatórios "Lançamentos do período") */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
                Histórico de recibos emitidos
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20">
                {recibos.length}
              </span>
            </div>

            {/* Worker Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#707a82] dark:text-[#7c8fac] shrink-0 font-medium">Filtrar trabalhador:</span>
              <select
                value={reciboWorkerFilter}
                onChange={e => {
                  setReciboWorkerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#162232] text-[#111c2d] dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0085db] cursor-pointer"
              >
                <option value="all">Todos os Trabalhadores</option>
                {reciboWorkerOptions.map(nome => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search inside Table - matching RelatoriosView */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#707a82] dark:text-[#7c8fac]" />
            <input
              type="text"
              placeholder="Filtrar recibos por número, beneficiário, CPF ou motivo..."
              value={reciboSearchTerm}
              onChange={e => {
                setReciboSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-[#707a82]/70 focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
            />
            {reciboSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setReciboSearchTerm('');
                  setCurrentPage(1);
                }}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white text-xs cursor-pointer p-0.5"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recibos Table matching RelatoriosView */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider" style={{ height: '53px' }}>
                  <th className="px-2 align-middle" style={{ height: '53px' }}>RECIBO</th>
                  <th className="px-3 align-middle" style={{ height: '53px' }}>TRABALHADOR</th>
                  <th className="px-3 align-middle" style={{ height: '53px' }}>PERÍODO / MOTIVO</th>
                  <th className="px-2 text-right align-middle" style={{ height: '53px' }}>VALOR</th>
                  <th className="px-3 text-right align-middle" style={{ height: '53px' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf1]/70 dark:divide-[#333f55]/60">
                {paginatedRecibos.length > 0 ? (
                  paginatedRecibos.map(rec => (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#f6f9fc]/80 dark:hover:bg-[#162232]/50 transition-colors"
                      style={{ height: '53px' }}
                    >
                      {/* RECIBO */}
                      <td className="px-2 text-xs font-semibold text-[#111c2d] dark:text-white whitespace-nowrap align-middle" style={{ height: '53px' }}>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-bold text-xs text-[#0085db] bg-[#0085db]/10 px-2 py-0.5 rounded-lg border border-[#0085db]/20">
                            {rec.numeroRecibo}
                          </span>
                          <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] tabular-nums">
                            {formatDateBR(rec.dataEmissao)}
                          </span>
                        </div>
                      </td>

                      {/* TRABALHADOR */}
                      <td className="px-3 whitespace-nowrap align-middle" style={{ height: '53px' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0085db] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {rec.trabalhadorNome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#111c2d] dark:text-white uppercase leading-none">
                                {rec.trabalhadorNome}
                              </span>
                              {rec.trabalhadorFuncao && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#f6f9fc] dark:bg-[#162232] text-[#707a82] dark:text-[#7c8fac] border border-[#e6ecf1] dark:border-[#333f55]">
                                  {rec.trabalhadorFuncao}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block leading-none mt-1">
                              CPF: {rec.trabalhadorCpf || 'Não informado'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* PERÍODO / MOTIVO */}
                      <td className="px-3 align-middle" style={{ height: '53px' }}>
                        <p className="text-xs font-semibold text-[#111c2d] dark:text-white leading-tight">
                          {formatDateBR(rec.periodoInicio)} a {formatDateBR(rec.periodoFim)}
                        </p>
                        {rec.motivo && (
                          <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5 truncate max-w-xs sm:max-w-md" title={rec.motivo}>
                            {rec.motivo}
                          </p>
                        )}
                      </td>

                      {/* VALOR */}
                      <td className="px-2 text-right text-xs sm:text-sm font-extrabold text-[#111c2d] dark:text-white tabular-nums whitespace-nowrap align-middle" style={{ height: '53px' }}>
                        {formatBRL(rec.valorTotal)}
                      </td>

                      {/* AÇÕES */}
                      <td className="px-3 text-right align-middle" style={{ height: '53px' }}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Visualizar */}
                          <button
                            type="button"
                            onClick={() => handleVisualizarRecibo(rec)}
                            title="Visualizar modelo oficial"
                            aria-label="Visualizar modelo oficial"
                            className="w-7 h-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#0085db] hover:border-[#0085db]/40 hover:bg-[#f6f9fc] dark:hover:bg-[#162232] transition-colors cursor-pointer inline-flex items-center justify-center shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleOpenFullEdit(rec)}
                            title="Editar dados do recibo"
                            aria-label="Editar dados do recibo"
                            className="w-7 h-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#0085db] hover:border-[#0085db]/40 hover:bg-[#f6f9fc] dark:hover:bg-[#162232] transition-colors cursor-pointer inline-flex items-center justify-center shrink-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(rec)}
                            title="Excluir recibo"
                            aria-label="Excluir recibo"
                            className="w-7 h-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#fb977d] hover:border-[#fb977d]/40 hover:bg-[#fb977d]/10 transition-colors cursor-pointer inline-flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ height: '53px' }}>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#707a82] dark:text-[#7c8fac] align-middle" style={{ height: '53px' }}>
                      {recibos.length === 0
                        ? 'Nenhum recibo emitido até o momento.'
                        : 'Nenhum recibo encontrado com os filtros selecionados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching RelatoriosView */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] text-xs text-[#707a82] dark:text-[#7c8fac]">
            <span>
              {totalItems > 0
                ? `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, totalItems)} de ${totalItems} registros`
                : '0 registros'}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Página anterior"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#111c2d] dark:text-white" />
                </button>

                {/* Left Ellipsis */}
                {paginationConfig.hasPrevEllipsis && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 3))}
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-transparent text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] hover:border-[#e6ecf1] dark:hover:border-[#333f55] transition-colors cursor-pointer"
                    title="Voltar 3 páginas"
                  >
                    ...
                  </button>
                )}

                {/* Page Number Buttons */}
                {paginationConfig.pages.map(pageNum => {
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#0085db]/15 text-[#0085db] border border-[#0085db]/30 dark:bg-[#0085db]/30 dark:text-white'
                          : 'border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#162232]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Right Ellipsis */}
                {paginationConfig.hasNextEllipsis && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 3))}
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg border border-transparent text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] hover:border-[#e6ecf1] dark:hover:border-[#333f55] transition-colors cursor-pointer"
                    title="Avançar 3 páginas"
                  >
                    ...
                  </button>
                )}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e6ecf1] dark:border-[#333f55] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Próxima página"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#111c2d] dark:text-white" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

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
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white font-bold focus:border-[#0085db] focus:outline-hidden"
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
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] rounded-xl transition-colors cursor-pointer"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white font-bold focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white font-semibold focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
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
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#0085db] focus:border-[#0085db] focus:outline-hidden tabular-nums"
              />
            </div>
            <div className="bg-[#f6f9fc] dark:bg-[#162232] p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55]">
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white focus:border-[#0085db] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
            <button
              type="button"
              onClick={() => setFullEditRecibo(null)}
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] rounded-xl transition-colors cursor-pointer"
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
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#fb977d]/15 border border-[#fb977d]/30 text-[#d5745b] dark:text-[#fb977d]">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Atenção ao excluir o recibo:</p>
              <p className="text-[#111c2d] dark:text-[#e6ecf1]">
                O recibo <strong>{deletingRecibo?.numeroRecibo}</strong> de <strong>{deletingRecibo?.trabalhadorNome}</strong> no valor de <strong>{deletingRecibo ? formatBRL(deletingRecibo.valorTotal) : ''}</strong> será removido do histórico.
              </p>
            </div>
          </div>

          {deletingRecibo?.diariasIds && deletingRecibo.diariasIds.length > 0 && (
            <label className="flex items-center gap-2 p-3 bg-[#f6f9fc] dark:bg-[#162232] rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-xs cursor-pointer">
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
              className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#162232] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-[#fb977d] hover:bg-[#d5745b] rounded-xl transition-colors shadow-sm shadow-[#fb977d]/25 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Recibo</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Pré-visualização A4 em Tela Cheia */}
      <ReciboPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        recibo={previewRecibo}
        obraNome={activeObra?.nome}
      />
    </>
  );
};
