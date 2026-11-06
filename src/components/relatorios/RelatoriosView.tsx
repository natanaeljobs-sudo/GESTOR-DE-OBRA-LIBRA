import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';
import {
  Download,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Eye,
} from 'lucide-react';
import { RelatorioObraImpresso } from './RelatorioObraImpresso';
import { RelatorioPreviewModal } from './RelatorioPreviewModal';
import { triggerSystemPrint } from '../../utils/relatorioPrintService';

interface LedgerItem {
  id: string;
  data: string;
  categoriaKey: 'materiais' | 'mao_de_obra' | 'trilhos_producao' | 'abastecimentos' | 'outros';
  tipoLabel: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  descricao: string;
  subtitulo: string;
  valor: number;
}

export const RelatoriosView: React.FC = () => {
  const {
    activeObra,
    despesas,
    diarias,
    etapas,
  } = useApp();

  // Date range state
  const [dataInicio, setDataInicio] = useState(activeObra?.dataInicio || '2026-09-08');
  const [dataFim, setDataFim] = useState(activeObra?.id === 'obra-juscelino-mola' ? '2026-10-30' : getTodayISO());
  const [selectedEtapa, setSelectedEtapa] = useState('todas');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Date picker popover state
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [tempInicio, setTempInicio] = useState(dataInicio);
  const [tempFim, setTempFim] = useState(dataFim);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  // Etapa dropdown state
  const [isEtapaDropdownOpen, setIsEtapaDropdownOpen] = useState(false);
  const etapaDropdownRef = useRef<HTMLDivElement>(null);

  // Table filter tab state
  const [categoryTab, setCategoryTab] = useState<string>('todos');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePopoverRef.current && !datePopoverRef.current.contains(event.target as Node)) {
        setIsDatePopoverOpen(false);
      }
      if (etapaDropdownRef.current && !etapaDropdownRef.current.contains(event.target as Node)) {
        setIsEtapaDropdownOpen(false);
      }
    }
    if (isDatePopoverOpen || isEtapaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePopoverOpen, isEtapaDropdownOpen]);

  // Sync temp dates when popover opens
  const handleOpenDatePopover = () => {
    setTempInicio(dataInicio);
    setTempFim(dataFim);
    setIsDatePopoverOpen(prev => !prev);
  };

  // Date shortcuts
  const applyDateShortcut = (tipo: 'mes_atual' | 'ultimos_30' | 'obra_toda' | 'mes_anterior') => {
    const today = new Date();
    const todayISO = getTodayISO();

    if (tipo === 'mes_atual') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      setDataInicio(start);
      setDataFim(todayISO);
      setTempInicio(start);
      setTempFim(todayISO);
    } else if (tipo === 'ultimos_30') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      const pastISO = past.toISOString().split('T')[0];
      setDataInicio(pastISO);
      setDataFim(todayISO);
      setTempInicio(pastISO);
      setTempFim(todayISO);
    } else if (tipo === 'obra_toda') {
      const start = activeObra?.dataInicio || '2026-09-01';
      setDataInicio(start);
      setDataFim(todayISO);
      setTempInicio(start);
      setTempFim(todayISO);
    } else if (tipo === 'mes_anterior') {
      const firstDayPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0);
      const start = firstDayPrev.toISOString().split('T')[0];
      const end = lastDayPrev.toISOString().split('T')[0];
      setDataInicio(start);
      setDataFim(end);
      setTempInicio(start);
      setTempFim(end);
    }

    setIsDatePopoverOpen(false);
    setCurrentPage(1);
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempInicio && tempFim) {
      setDataInicio(tempInicio);
      setDataFim(tempFim);
      setIsDatePopoverOpen(false);
      setCurrentPage(1);
    }
  };

  // Filter Despesas and Diárias
  const filteredDespesas = useMemo(() => {
    return despesas.filter(d => {
      const inDate = d.data >= dataInicio && d.data <= dataFim;
      const inEtapa = selectedEtapa === 'todas' || d.etapaId === selectedEtapa;
      return inDate && inEtapa;
    });
  }, [despesas, dataInicio, dataFim, selectedEtapa]);

  const filteredDiarias = useMemo(() => {
    return diarias.filter(d => {
      const inDate = d.data >= dataInicio && d.data <= dataFim;
      const inEtapa = selectedEtapa === 'todas' || d.etapaId === selectedEtapa;
      return inDate && inEtapa;
    });
  }, [diarias, dataInicio, dataFim, selectedEtapa]);

  // Combine into single sorted ledger
  const allLedgerItems = useMemo<LedgerItem[]>(() => {
    const list: LedgerItem[] = [];

    // Despesas
    filteredDespesas.forEach(d => {
      let catKey: 'materiais' | 'mao_de_obra' | 'trilhos_producao' | 'abastecimentos' | 'outros' = 'outros';
      let label = 'Outros';
      let badgeBg = 'bg-[#707a82]/10 dark:bg-[#707a82]/20';
      let badgeText = 'text-[#707a82] dark:text-[#7c8fac]';
      let dotColor = '#707a82';

      if (d.categoria === 'materiais') {
        catKey = 'materiais';
        label = 'Materiais';
        badgeBg = 'bg-[#0085db]/10 dark:bg-[#0085db]/20';
        badgeText = 'text-[#0085db]';
        dotColor = '#0085db';
      } else if (d.categoria === 'trilhos_producao') {
        catKey = 'trilhos_producao';
        label = 'Trilhos';
        badgeBg = 'bg-[#8763da]/10 dark:bg-[#8763da]/20';
        badgeText = 'text-[#8763da]';
        dotColor = '#8763da';
      } else if (d.categoria === 'abastecimentos') {
        catKey = 'abastecimentos';
        label = 'Abastec.';
        badgeBg = 'bg-[#46caeb]/10 dark:bg-[#46caeb]/20';
        badgeText = 'text-[#179ab8] dark:text-[#46caeb]';
        dotColor = '#46caeb';
      } else if (d.categoria === 'mao_de_obra') {
        catKey = 'mao_de_obra';
        label = 'Mão de obra';
        badgeBg = 'bg-[#4bd08b]/10 dark:bg-[#4bd08b]/20';
        badgeText = 'text-[#2ba367] dark:text-[#4bd08b]';
        dotColor = '#4bd08b';
      }

      list.push({
        id: `desp_${d.id}`,
        data: d.data,
        categoriaKey: catKey,
        tipoLabel: label,
        badgeBg,
        badgeText,
        dotColor,
        descricao: d.descricao,
        subtitulo: d.fornecedorNome || 'Fornecedor da obra',
        valor: d.valorTotalNota,
      });
    });

    // Diárias (Mão de obra)
    filteredDiarias.forEach(dia => {
      list.push({
        id: `dia_${dia.id}`,
        data: dia.data,
        categoriaKey: 'mao_de_obra',
        tipoLabel: 'Mão de obra',
        badgeBg: 'bg-[#4bd08b]/10 dark:bg-[#4bd08b]/20',
        badgeText: 'text-[#2ba367] dark:text-[#4bd08b]',
        dotColor: '#4bd08b',
        descricao: `Diária ${dia.trabalhadorNome} (${dia.fracao}x)`,
        subtitulo: dia.descricaoAdicional || (dia.valorAdicional > 0 ? `Adicional: ${formatBRL(dia.valorAdicional)}` : 'Serviço de obra executado'),
        valor: dia.valorTotal,
      });
    });

    // Sort descending by date, then by valor
    return list.sort((a, b) => {
      if (b.data !== a.data) {
        return b.data.localeCompare(a.data);
      }
      return b.valor - a.valor;
    });
  }, [filteredDespesas, filteredDiarias]);

  // Aggregate Category Totals for the current filtered date range
  const categoryStats = useMemo(() => {
    let materiais = 0;
    let mao_de_obra = 0;
    let trilhos = 0;
    let abastecimentos = 0;
    let outros = 0;

    allLedgerItems.forEach(item => {
      if (item.categoriaKey === 'materiais') materiais += item.valor;
      else if (item.categoriaKey === 'mao_de_obra') mao_de_obra += item.valor;
      else if (item.categoriaKey === 'trilhos_producao') trilhos += item.valor;
      else if (item.categoriaKey === 'abastecimentos') abastecimentos += item.valor;
      else outros += item.valor;
    });

    const total = materiais + mao_de_obra + trilhos + abastecimentos + outros;

    const list = [
      {
        key: 'materiais',
        label: 'Materiais da obra',
        tabLabel: 'Materiais',
        valor: materiais,
        percentual: total > 0 ? (materiais / total) * 100 : 0,
        color: '#0085db',
      },
      {
        key: 'mao_de_obra',
        label: 'Mão de obra',
        tabLabel: 'Mão de obra',
        valor: mao_de_obra,
        percentual: total > 0 ? (mao_de_obra / total) * 100 : 0,
        color: '#4bd08b',
      },
      {
        key: 'trilhos_producao',
        label: 'Produção de trilhos',
        tabLabel: 'Trilhos',
        valor: trilhos,
        percentual: total > 0 ? (trilhos / total) * 100 : 0,
        color: '#8763da',
      },
      {
        key: 'abastecimentos',
        label: 'Abastecimentos',
        tabLabel: 'Abastec.',
        valor: abastecimentos,
        percentual: total > 0 ? (abastecimentos / total) * 100 : 0,
        color: '#46caeb',
      },
    ];

    if (outros > 0) {
      list.push({
        key: 'outros',
        label: 'Outras despesas',
        tabLabel: 'Outros',
        valor: outros,
        percentual: total > 0 ? (outros / total) * 100 : 0,
        color: '#707a82',
      });
    }

    // Determine highest category
    let maior = list[0];
    list.forEach(c => {
      if (c.valor > maior.valor) {
        maior = c;
      }
    });

    return {
      total,
      count: allLedgerItems.length,
      categories: list,
      maiorCategoria: total > 0 ? maior : null,
    };
  }, [allLedgerItems]);

  // Filter by category tab and optional search in table
  const displayedLedgerItems = useMemo(() => {
    return allLedgerItems.filter(item => {
      const matchTab = categoryTab === 'todos' || item.categoriaKey === categoryTab;
      const matchSearch =
        !tableSearch.trim() ||
        item.descricao.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.subtitulo.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.tipoLabel.toLowerCase().includes(tableSearch.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [allLedgerItems, categoryTab, tableSearch]);

  // Pagination calculation
  const totalItems = displayedLedgerItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedItems = displayedLedgerItems.slice(startIndex, startIndex + itemsPerPage);

  // Pagination items calculation (< 1 2 3 ... >)
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

  // Helper for formatting short date (DD/MM)
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return formatDateBR(dateStr);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Tipo', 'Data', 'Descricao', 'Categoria', 'Fornecedor / Trabalhador', 'Valor (R$)'],
      ...filteredDespesas.map(d => [
        'Despesa',
        d.data,
        `"${d.descricao.replace(/"/g, '""')}"`,
        d.categoria,
        `"${d.fornecedorNome.replace(/"/g, '""')}"`,
        d.valorTotalNota.toFixed(2),
      ]),
      ...filteredDiarias.map(dia => [
        'Mao de Obra',
        dia.data,
        `"Diaria ${dia.fracao}x ${dia.descricaoAdicional || ''}"`,
        'Diaria',
        `"${dia.trabalhadorNome.replace(/"/g, '""')}"`,
        dia.valorTotal.toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_obra_${activeObra?.id || 'obra'}_${dataInicio}_a_${dataFim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    triggerSystemPrint({
      obra: activeObra,
      despesas: filteredDespesas,
      diarias: filteredDiarias,
      etapas,
      dataInicio,
      dataFim,
      autoPrint: true,
    });
  };

  // Helper to format etapa label: "Antes de Iniciar" without 0, and "1 - Sapata", "2 - Alvenaria", etc.
  const getEtapaLabel = (e: { numero: number; nome: string }) => {
    if (e.numero === 0) return e.nome;
    return `${e.numero} - ${e.nome}`;
  };

  // Find selected etapa label for filter button
  const selectedEtapaLabel = useMemo(() => {
    if (selectedEtapa === 'todas') return 'Todas as etapas';
    const found = etapas.find(e => e.id === selectedEtapa);
    return found ? getEtapaLabel(found) : 'Todas as etapas';
  }, [selectedEtapa, etapas]);

  const selectedEtapaNome = selectedEtapaLabel;

  return (
    <>
      {/* =========================================================================
          SCREEN VIEW (Hidden during print)
      ========================================================================= */}
      <div className="space-y-5 pb-20 lg:pb-8 animate-in fade-in duration-150 print:hidden">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white font-sans">
              Relatórios Financeiros
            </h1>
            <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5 font-sans">
              {activeObra?.nome || 'Obra Juscelino Mola'} · {formatDateBR(dataInicio)} a {formatDateBR(dataFim)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] hover:border-[#0085db]/40 hover:bg-[#f6f9fc] dark:hover:bg-[#1f2d42] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#707a82] dark:text-[#7c8fac]" />
              <span>Exportar CSV</span>
            </button>

            {/* Imprimir button */}
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer"
              title="Abrir pré-visualização do relatório executivo consolidado"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Date Range Selector Dropdown */}
          <div className="relative" ref={datePopoverRef}>
            <button
              onClick={handleOpenDatePopover}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 h-9 text-xs font-bold rounded-xl bg-[#0085db] hover:bg-[#0071ba] active:scale-95 text-white border border-[#0085db] shadow-sm shadow-[#0085db]/25 transition-all cursor-pointer select-none"
            >
              <span>{formatDateBR(dataInicio)} – {formatDateBR(dataFim)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/90 shrink-0 ml-0.5" />
            </button>

            {/* Popover Menu */}
            {isDatePopoverOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider mb-2.5">
                  Atalhos de Período
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => applyDateShortcut('mes_atual')}
                    className="px-3 py-2 text-xs font-medium text-left rounded-xl bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white hover:bg-[#0085db]/10 hover:text-[#0085db] transition-colors cursor-pointer"
                  >
                    Mês Atual
                  </button>
                  <button
                    onClick={() => applyDateShortcut('ultimos_30')}
                    className="px-3 py-2 text-xs font-medium text-left rounded-xl bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white hover:bg-[#0085db]/10 hover:text-[#0085db] transition-colors cursor-pointer"
                  >
                    Últimos 30 Dias
                  </button>
                  <button
                    onClick={() => applyDateShortcut('mes_anterior')}
                    className="px-3 py-2 text-xs font-medium text-left rounded-xl bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white hover:bg-[#0085db]/10 hover:text-[#0085db] transition-colors cursor-pointer"
                  >
                    Mês Anterior
                  </button>
                  <button
                    onClick={() => applyDateShortcut('obra_toda')}
                    className="px-3 py-2 text-xs font-medium text-left rounded-xl bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white hover:bg-[#0085db]/10 hover:text-[#0085db] transition-colors cursor-pointer"
                  >
                    Obra Completa
                  </button>
                </div>

                <div className="border-t border-[#e6ecf1] dark:border-[#333f55] pt-3">
                  <p className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider mb-2">
                    Intervalo Personalizado
                  </p>
                  <form onSubmit={handleApplyCustomDates} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block mb-1">Início</label>
                        <input
                          type="date"
                          value={tempInicio}
                          onChange={e => setTempInicio(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#707a82] dark:text-[#7c8fac] block mb-1">Fim</label>
                        <input
                          type="date"
                          value={tempFim}
                          onChange={e => setTempFim(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0085db] text-white rounded-xl text-xs font-bold hover:bg-[#0071ba] transition-colors cursor-pointer mt-1"
                    >
                      Aplicar Intervalo
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Etapas Selector */}
          <div className="relative" ref={etapaDropdownRef}>
            <button
              type="button"
              onClick={() => setIsEtapaDropdownOpen(!isEtapaDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white shadow-xs hover:border-[#0085db]/40 active:scale-95 transition-all cursor-pointer select-none whitespace-nowrap"
            >
              <span>{selectedEtapaLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#707a82] dark:text-[#7c8fac] transition-transform duration-150 ${isEtapaDropdownOpen ? 'rotate-180 text-[#0085db]' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isEtapaDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 min-w-full w-max max-h-72 overflow-y-auto bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEtapa('todas');
                    setIsEtapaDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    selectedEtapa === 'todas'
                      ? 'bg-[#0085db] text-white font-bold'
                      : 'text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#162232]'
                  }`}
                >
                  <span>Todas as etapas</span>
                  {selectedEtapa === 'todas' && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>

                <div className="border-t border-[#e6ecf1]/60 dark:border-[#333f55]/60 my-1" />

                {etapas.map(e => {
                  const label = getEtapaLabel(e);
                  const isSelected = selectedEtapa === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setSelectedEtapa(e.id);
                        setIsEtapaDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#0085db] text-white font-bold'
                          : 'text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#162232]'
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Grid (Matching reference layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: TOTAL APURADO */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              TOTAL APURADO
            </span>
            <div className="mt-3 flex items-baseline justify-center gap-1.5">
              <span className="text-sm font-bold text-[#0085db]">R$</span>
              <span className="text-2xl sm:text-3xl font-black text-[#0085db] tabular-nums tracking-tight">
                {formatBRL(categoryStats.total).replace('R$', '').trim()}
              </span>
            </div>
          </div>

          {/* Card 2: LANÇAMENTOS */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              LANÇAMENTOS
            </span>
            <div className="mt-3 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight block text-center">
                {categoryStats.count}
              </span>
            </div>
          </div>

          {/* Card 3: MAIOR CATEGORIA */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
              MAIOR CATEGORIA
            </span>
            <div className="mt-3 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-[#111c2d] dark:text-white tracking-tight block text-center">
                {categoryStats.maiorCategoria
                  ? `${categoryStats.maiorCategoria.tabLabel} · ${categoryStats.maiorCategoria.percentual.toFixed(1).replace('.', ',')}%`
                  : 'Nenhum lançamento'}
              </span>
            </div>
          </div>

        </div>

        {/* Card: Resumo por Categoria */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
            Resumo por categoria
          </h2>

          {/* Stacked Proportional Progress Bar */}
          <div className="w-full h-3 bg-[#f0f5f9] dark:bg-[#162232] rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {categoryStats.total > 0 ? (
              categoryStats.categories.map(cat => {
                if (cat.valor <= 0) return null;
                return (
                  <div
                    key={cat.key}
                    style={{ width: `${Math.max(2, cat.percentual)}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full transition-all duration-300"
                    title={`${cat.label}: ${formatBRL(cat.valor)} (${cat.percentual.toFixed(1)}%)`}
                  />
                );
              })
            ) : (
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            )}
          </div>

          {/* Categories List */}
          <div className="divide-y divide-[#e6ecf1]/70 dark:divide-[#333f55]/60 pt-1">
            {categoryStats.categories.map(cat => (
              <div
                key={cat.key}
                className="flex items-center justify-between py-2.5 text-xs sm:text-sm hover:bg-[#f6f9fc]/50 dark:hover:bg-[#162232]/40 px-1 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-[#111c2d] dark:text-white">
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 sm:gap-10">
                  <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                    {formatBRL(cat.valor)}
                  </span>
                  <span className="w-12 text-right font-medium text-[#707a82] dark:text-[#7c8fac] tabular-nums text-xs">
                    {cat.percentual.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Lançamentos do Período */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
              Lançamentos do período
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setCategoryTab('todos');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  categoryTab === 'todos'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => {
                  setCategoryTab('materiais');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  categoryTab === 'materiais'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Materiais
              </button>

              <button
                onClick={() => {
                  setCategoryTab('mao_de_obra');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  categoryTab === 'mao_de_obra'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Mão de obra
              </button>

              <button
                onClick={() => {
                  setCategoryTab('trilhos_producao');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  categoryTab === 'trilhos_producao'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Trilhos
              </button>

              <button
                onClick={() => {
                  setCategoryTab('abastecimentos');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  categoryTab === 'abastecimentos'
                    ? 'bg-[#0085db] text-white shadow-xs'
                    : 'bg-white dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:text-[#111c2d] dark:hover:text-white'
                }`}
              >
                Abastecimentos
              </button>
            </div>
          </div>

          {/* Quick Search inside Table */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#707a82] dark:text-[#7c8fac]" />
            <input
              type="text"
              placeholder="Filtrar lançamentos por descrição, fornecedor ou trabalhador..."
              value={tableSearch}
              onChange={e => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#162232] text-[#111c2d] dark:text-white placeholder:text-[#707a82]/70 focus:outline-hidden focus:ring-1 focus:ring-[#0085db]"
            />
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
                  <th className="pb-3 px-2">DATA</th>
                  <th className="pb-3 px-3">TIPO</th>
                  <th className="pb-3 px-3">DESCRIÇÃO</th>
                  <th className="pb-3 px-2 text-right">VALOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf1]/70 dark:divide-[#333f55]/60">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f6f9fc]/80 dark:hover:bg-[#162232]/50 transition-colors"
                    >
                      {/* DATA */}
                      <td className="py-3 px-2 text-xs font-semibold text-[#111c2d] dark:text-white whitespace-nowrap">
                        {formatShortDate(item.data)}
                      </td>

                      {/* TIPO */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${item.badgeBg} ${item.badgeText}`}
                        >
                          {item.tipoLabel}
                        </span>
                      </td>

                      {/* DESCRIÇÃO */}
                      <td className="py-3 px-3">
                        <p className="text-xs sm:text-sm font-semibold text-[#111c2d] dark:text-white leading-tight">
                          {item.descricao}
                        </p>
                        {item.subtitulo && (
                          <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5 truncate max-w-xs sm:max-w-md">
                            {item.subtitulo}
                          </p>
                        )}
                      </td>

                      {/* VALOR */}
                      <td className="py-3 px-2 text-right text-xs sm:text-sm font-extrabold text-[#111c2d] dark:text-white tabular-nums whitespace-nowrap">
                        {formatBRL(item.valor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[#707a82] dark:text-[#7c8fac]">
                      Nenhum lançamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Matching reference) */}
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

      {/* =========================================================================
          PRINT EXECUTIVE REPORT (3 Pages matching relatorio_obra_juscelino_mola)
      ========================================================================= */}
      {!isPreviewModalOpen && (
        <RelatorioObraImpresso
          obra={activeObra}
          despesas={filteredDespesas}
          diarias={filteredDiarias}
          etapas={etapas}
          dataInicio={dataInicio}
          dataFim={dataFim}
          isPrintOnly={true}
        />
      )}

      {/* Preview Modal for exploring the report on screen */}
      <RelatorioPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        obra={activeObra}
        despesas={filteredDespesas}
        diarias={filteredDiarias}
        etapas={etapas}
        dataInicio={dataInicio}
        dataFim={dataFim}
      />
    </>
  );
};
