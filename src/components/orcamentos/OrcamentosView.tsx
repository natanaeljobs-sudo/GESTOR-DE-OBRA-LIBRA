import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Orcamento, ItemOrcamento } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateBR, getTodayISO } from '../../utils/date';

interface ExtendedItemOrcamento extends ItemOrcamento {
  nome?: string;
  qtd?: string | number;
  un?: string;
  preco?: number;
  subtotal?: number;
}

interface ExtendedOrcamento {
  id: string;
  num: string;
  empresa: string;
  ident: string;
  data: string;
  dataISO: string;
  etapa?: string;
  status: 'cotacao' | 'aprovado' | 'recusado';
  statusLabel: string;
  statusBadgeClass: string;
  total: number;
  temFrete?: boolean;
  valorFrete?: number;
  prazoFrete?: string;
  condicoes: string;
  obs?: string;
  itens: ExtendedItemOrcamento[];
}

const DEFAULT_ORCAMENTOS: ExtendedOrcamento[] = [
  {
    id: 'orc-01',
    num: '01',
    empresa: 'COMERCIAL SILVA MATERIAIS',
    ident: 'COT-2026-109',
    data: '28/10/2026',
    dataISO: '2026-10-28',
    etapa: 'Fundação & Estrutura',
    status: 'cotacao',
    statusLabel: 'Cotação',
    statusBadgeClass:
      'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
    total: 5850.0,
    temFrete: true,
    valorFrete: 0,
    prazoFrete: '48h canteiro',
    condicoes: '3X NO BOLETO FATURADO OU PIX COM 5% DESC',
    obs: 'Frete grátis para entrega no canteiro em até 48h.',
    itens: [
      {
        id: 'it-1',
        nome: 'Cimento CP II 50kg',
        materialNome: 'Cimento CP II 50kg',
        qtd: '100 sc',
        quantidade: 100,
        un: 'sc',
        unidade: 'sc',
        preco: 34.0,
        precoUnitarioCotado: 34.0,
        subtotal: 3400.0,
        valorTotalCotado: 3400.0,
      },
      {
        id: 'it-2',
        nome: 'Areia Média Lavada',
        materialNome: 'Areia Média Lavada',
        qtd: '20 m³',
        quantidade: 20,
        un: 'm³',
        unidade: 'm³',
        preco: 92.0,
        precoUnitarioCotado: 92.0,
        subtotal: 1840.0,
        valorTotalCotado: 1840.0,
      },
      {
        id: 'it-3',
        nome: 'BRITA 1',
        materialNome: 'BRITA 1',
        qtd: '6 m³',
        quantidade: 6,
        un: 'm³',
        unidade: 'm³',
        preco: 101.66,
        precoUnitarioCotado: 101.66,
        subtotal: 610.0,
        valorTotalCotado: 610.0,
      },
    ],
  },
  {
    id: 'orc-02',
    num: '02',
    empresa: 'DEPÓSITO GOIÁS DA CONSTRUÇÃO',
    ident: 'PROP-8841',
    data: '29/10/2026',
    dataISO: '2026-10-29',
    etapa: 'Fundação & Estrutura',
    status: 'aprovado',
    statusLabel: 'Aprovado',
    statusBadgeClass:
      'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/30',
    total: 5590.0,
    temFrete: false,
    valorFrete: 0,
    prazoFrete: '',
    condicoes: 'À VISTA VIA PIX',
    obs: 'Excelente preço no cimento CP II (R$ 32,50/saco).',
    itens: [
      {
        id: 'it-4',
        nome: 'Cimento CP II 50kg',
        materialNome: 'Cimento CP II 50kg',
        qtd: '100 sc',
        quantidade: 100,
        un: 'sc',
        unidade: 'sc',
        preco: 32.5,
        precoUnitarioCotado: 32.5,
        subtotal: 3250.0,
        valorTotalCotado: 3250.0,
      },
      {
        id: 'it-5',
        nome: 'Areia Média Lavada',
        materialNome: 'Areia Média Lavada',
        qtd: '20 m³',
        quantidade: 20,
        un: 'm³',
        unidade: 'm³',
        preco: 95.0,
        precoUnitarioCotado: 95.0,
        subtotal: 1900.0,
        valorTotalCotado: 1900.0,
      },
      {
        id: 'it-6',
        nome: 'BRITA 1',
        materialNome: 'BRITA 1',
        qtd: '6 m³',
        quantidade: 6,
        un: 'm³',
        unidade: 'm³',
        preco: 73.33,
        precoUnitarioCotado: 73.33,
        subtotal: 440.0,
        valorTotalCotado: 440.0,
      },
    ],
  },
  {
    id: 'orc-03',
    num: '03',
    empresa: 'CIMENTO & CIA ATACADISTA',
    ident: 'ORC-NOV-01',
    data: '01/11/2026',
    dataISO: '2026-11-01',
    etapa: 'Fundação & Estrutura',
    status: 'recusado',
    statusLabel: 'Arquivado',
    statusBadgeClass:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    total: 6200.0,
    temFrete: true,
    valorFrete: 150.0,
    prazoFrete: '24h express',
    condicoes: 'CARTÃO EM ATÉ 4X SEM JUROS',
    obs: 'Preço acima da concorrência local.',
    itens: [
      {
        id: 'it-7',
        nome: 'Cimento CP II 50kg',
        materialNome: 'Cimento CP II 50kg',
        qtd: '100 sc',
        quantidade: 100,
        un: 'sc',
        unidade: 'sc',
        preco: 36.0,
        precoUnitarioCotado: 36.0,
        subtotal: 3600.0,
        valorTotalCotado: 3600.0,
      },
      {
        id: 'it-8',
        nome: 'Areia Média Lavada',
        materialNome: 'Areia Média Lavada',
        qtd: '20 m³',
        quantidade: 20,
        un: 'm³',
        unidade: 'm³',
        preco: 98.0,
        precoUnitarioCotado: 98.0,
        subtotal: 1960.0,
        valorTotalCotado: 1960.0,
      },
      {
        id: 'it-9',
        nome: 'BRITA 1',
        materialNome: 'BRITA 1',
        qtd: '6 m³',
        quantidade: 6,
        un: 'm³',
        unidade: 'm³',
        preco: 106.66,
        precoUnitarioCotado: 106.66,
        subtotal: 640.0,
        valorTotalCotado: 640.0,
      },
    ],
  },
  {
    id: 'orc-04',
    num: '04',
    empresa: 'VOTORAN DISTRIBUIDORA',
    ident: 'COT-VT-2026',
    data: '02/11/2026',
    dataISO: '2026-11-02',
    etapa: 'Fundação & Estrutura',
    status: 'cotacao',
    statusLabel: 'Cotação',
    statusBadgeClass:
      'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
    total: 5806.0,
    temFrete: true,
    valorFrete: 0,
    prazoFrete: 'Descarga inclusa',
    condicoes: 'BOLETO 30 DIAS OU CARTÃO EM 3X',
    obs: 'Descarga inclusa no canteiro da obra.',
    itens: [
      {
        id: 'it-10',
        nome: 'Cimento CP II 50kg',
        materialNome: 'Cimento CP II 50kg',
        qtd: '100 sc',
        quantidade: 100,
        un: 'sc',
        unidade: 'sc',
        preco: 33.5,
        precoUnitarioCotado: 33.5,
        subtotal: 3350.0,
        valorTotalCotado: 3350.0,
      },
      {
        id: 'it-11',
        nome: 'Areia Média Lavada',
        materialNome: 'Areia Média Lavada',
        qtd: '20 m³',
        quantidade: 20,
        un: 'm³',
        unidade: 'm³',
        preco: 94.0,
        precoUnitarioCotado: 94.0,
        subtotal: 1880.0,
        valorTotalCotado: 1880.0,
      },
      {
        id: 'it-12',
        nome: 'BRITA 1',
        materialNome: 'BRITA 1',
        qtd: '6 m³',
        quantidade: 6,
        un: 'm³',
        unidade: 'm³',
        preco: 96.0,
        precoUnitarioCotado: 96.0,
        subtotal: 576.0,
        valorTotalCotado: 576.0,
      },
    ],
  },
  {
    id: 'orc-05',
    num: '05',
    empresa: 'CONSTRUCENTER BRASIL',
    ident: 'PROP-9910',
    data: '03/11/2026',
    dataISO: '2026-11-03',
    etapa: 'Fundação & Estrutura',
    status: 'cotacao',
    statusLabel: 'Cotação',
    statusBadgeClass:
      'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
    total: 6032.0,
    temFrete: false,
    valorFrete: 0,
    prazoFrete: '',
    condicoes: 'PIX COM 7% DESCONTO',
    obs: 'Cotação válida por 48 horas úteis.',
    itens: [
      {
        id: 'it-13',
        nome: 'Cimento CP II 50kg',
        materialNome: 'Cimento CP II 50kg',
        qtd: '100 sc',
        quantidade: 100,
        un: 'sc',
        unidade: 'sc',
        preco: 35.0,
        precoUnitarioCotado: 35.0,
        subtotal: 3500.0,
        valorTotalCotado: 3500.0,
      },
      {
        id: 'it-14',
        nome: 'Areia Média Lavada',
        materialNome: 'Areia Média Lavada',
        qtd: '20 m³',
        quantidade: 20,
        un: 'm³',
        unidade: 'm³',
        preco: 96.0,
        precoUnitarioCotado: 96.0,
        subtotal: 1920.0,
        valorTotalCotado: 1920.0,
      },
      {
        id: 'it-15',
        nome: 'BRITA 1',
        materialNome: 'BRITA 1',
        qtd: '6 m³',
        quantidade: 6,
        un: 'm³',
        unidade: 'm³',
        preco: 102.0,
        precoUnitarioCotado: 102.0,
        subtotal: 612.0,
        valorTotalCotado: 612.0,
      },
    ],
  },
];

export const OrcamentosView: React.FC = () => {
  const { converterOrcamentoEmDespesa } = useApp();

  // Load Material Symbols Font if not loaded
  useEffect(() => {
    if (!document.getElementById('material-symbols-font')) {
      const link = document.createElement('link');
      link.id = 'material-symbols-font';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Main state
  const [orcamentosList, setOrcamentosList] = useState<ExtendedOrcamento[]>(DEFAULT_ORCAMENTOS);
  const [activeTab, setActiveTab] = useState<'orcamentos' | 'comparador'>('orcamentos');
  const [orcamentosComparando, setOrcamentosComparando] = useState<string[]>([
    'orc-01',
    'orc-02',
    'orc-03',
  ]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'cotacao' | 'aprovado' | 'recusado'>('todos');
  const [etapaFilter, setEtapaFilter] = useState('todas');
  const [sortOption, setSortOption] = useState<'recente' | 'antigo' | 'menor-valor' | 'maior-valor'>('recente');

  // Pagination (Desktop: 4/página, Tablet/Mobile: 3/página)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modals state
  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [isModalConverterOpen, setIsModalConverterOpen] = useState(false);
  const [isModalExcluirOpen, setIsModalExcluirOpen] = useState(false);
  const [isModalArquivarOpen, setIsModalArquivarOpen] = useState(false);
  const [isModalLimparOpen, setIsModalLimparOpen] = useState(false);
  const [isModalJuntarOpen, setIsModalJuntarOpen] = useState(false);
  const [isModalMaterialInPlaceOpen, setIsModalMaterialInPlaceOpen] = useState(false);

  // Selected item for actions
  const [selectedOrc, setSelectedOrc] = useState<ExtendedOrcamento | null>(null);
  const [convertFormaPagamento, setConvertFormaPagamento] = useState('pix');

  // Form: Nova Cotação
  const [novoEmpresa, setNovoEmpresa] = useState('');
  const [novoIdent, setNovoIdent] = useState('');
  const [novoEtapa, setNovoEtapa] = useState('Fundação & Estrutura');
  const [novoData, setNovoData] = useState(getTodayISO());
  const [novoStatus, setNovoStatus] = useState<'cotacao' | 'aprovado'>('cotacao');
  const [novoCondicoes, setNovoCondicoes] = useState('');
  const [novoObs, setNovoObs] = useState('');
  const [novoTemFrete, setNovoTemFrete] = useState(false);
  const [novoValorFrete, setNovoValorFrete] = useState<string>('');
  const [novoPrazoFrete, setNovoPrazoFrete] = useState('');
  const [novoItens, setNovoItens] = useState<
    { nome: string; qtd: string; preco: number; un: string }[]
  >([
    { nome: 'CIMENTO CP II 50KG', qtd: '50', preco: 34, un: 'sc' },
  ]);

  // Form: Editar Orçamento
  const [editEmpresa, setEditEmpresa] = useState('');
  const [editIdent, setEditIdent] = useState('');
  const [editData, setEditData] = useState('');
  const [editStatus, setEditStatus] = useState<'cotacao' | 'aprovado' | 'recusado'>('cotacao');
  const [editCondicoes, setEditCondicoes] = useState('');
  const [editObs, setEditObs] = useState('');
  const [editTemFrete, setEditTemFrete] = useState(false);
  const [editValorFrete, setEditValorFrete] = useState<string>('');
  const [editPrazoFrete, setEditPrazoFrete] = useState('');
  const [editItens, setEditItens] = useState<
    { nome: string; qtd: string; preco: number; un: string }[]
  >([]);

  // Form: Cadastrar Material In-Place
  const [novoMatNome, setNovoMatNome] = useState('');
  const [novoMatUnidade, setNovoMatUnidade] = useState('un');
  const [novoMatPreco, setNovoMatPreco] = useState('');

  // Juntar Modal search & sort
  const [juntarSearch, setJuntarSearch] = useState('');
  const [juntarSort, setJuntarSort] = useState<'recente' | 'antigo' | 'menor_valor' | 'maior_valor'>('recente');

  // Filtered quotes
  const filteredOrcamentos = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    let res = orcamentosList.filter(orc => {
      if (q) {
        const match =
          orc.empresa.toLowerCase().includes(q) ||
          orc.ident.toLowerCase().includes(q) ||
          orc.data.includes(q) ||
          (orc.etapa || '').toLowerCase().includes(q) ||
          orc.itens.some(i => i.nome?.toLowerCase().includes(q) || i.materialNome.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (statusFilter !== 'todos' && orc.status !== statusFilter) return false;
      if (etapaFilter !== 'todas' && orc.etapa !== etapaFilter) return false;
      return true;
    });

    res.sort((a, b) => {
      if (sortOption === 'menor-valor') return a.total - b.total;
      if (sortOption === 'maior-valor') return b.total - a.total;
      if (sortOption === 'antigo') return new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime();
      return new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime();
    });

    return res;
  }, [orcamentosList, searchTerm, statusFilter, etapaFilter, sortOption]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredOrcamentos.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedOrcamentos = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredOrcamentos.slice(start, start + itemsPerPage);
  }, [filteredOrcamentos, safeCurrentPage, itemsPerPage]);

  // Total amount of quoted items
  const totalValorCotado = useMemo(() => {
    return orcamentosList.reduce((sum, o) => sum + o.total, 0);
  }, [orcamentosList]);

  // Comparative metrics
  const orcamentosAtivosNoComparador = useMemo(() => {
    return orcamentosList.filter(o => orcamentosComparando.includes(o.id));
  }, [orcamentosList, orcamentosComparando]);

  const kpisComparador = useMemo(() => {
    if (orcamentosAtivosNoComparador.length === 0) {
      return {
        menor: 0,
        maior: 0,
        diferenca: 0,
        lojaVencedora: '—',
        lojaMaior: '—',
        percentualEconomia: 0,
      };
    }
    const totais = orcamentosAtivosNoComparador.map(o => o.total);
    const menor = Math.min(...totais);
    const maior = Math.max(...totais);
    const diferenca = maior - menor;
    const orcMenor = orcamentosAtivosNoComparador.find(o => o.total === menor);
    const orcMaior = orcamentosAtivosNoComparador.find(o => o.total === maior);
    const percentual = maior > 0 ? (diferenca / maior) * 100 : 0;

    return {
      menor,
      maior,
      diferenca,
      lojaVencedora: orcMenor ? orcMenor.empresa : '—',
      lojaMaior: orcMaior ? orcMaior.empresa : '—',
      percentualEconomia: percentual,
    };
  }, [orcamentosAtivosNoComparador]);

  // Item comparison matrix
  const matrixMateriais = useMemo(() => {
    const map = new Map<string, { nome: string; un: string }>();
    orcamentosAtivosNoComparador.forEach(orc => {
      orc.itens.forEach(it => {
        const n = it.nome || it.materialNome;
        if (!map.has(n)) {
          map.set(n, { nome: n, un: it.un || it.unidade || 'un' });
        }
      });
    });
    return Array.from(map.values());
  }, [orcamentosAtivosNoComparador]);

  // Action handlers
  const handleOpenDetalhes = (orc: ExtendedOrcamento) => {
    setSelectedOrc(orc);
    setIsModalDetalhesOpen(true);
  };

  const handleOpenEditar = (orc: ExtendedOrcamento) => {
    setSelectedOrc(orc);
    setEditEmpresa(orc.empresa);
    setEditIdent(orc.ident);
    setEditData(orc.dataISO);
    setEditStatus(orc.status);
    setEditCondicoes(orc.condicoes);
    setEditObs(orc.obs || '');
    setEditTemFrete(!!orc.temFrete);
    setEditValorFrete(orc.valorFrete ? orc.valorFrete.toString() : '');
    setEditPrazoFrete(orc.prazoFrete || '');
    setEditItens(
      orc.itens.map(i => ({
        nome: i.nome || i.materialNome,
        qtd: String(i.qtd ?? i.quantidade),
        preco: i.preco || i.precoUnitarioCotado,
        un: i.un || i.unidade || 'un',
      }))
    );
    setIsModalEditarOpen(true);
  };

  const handleOpenConverter = (orc: ExtendedOrcamento) => {
    setSelectedOrc(orc);
    setIsModalConverterOpen(true);
  };

  const handleConfirmarConversao = () => {
    if (!selectedOrc) return;
    setOrcamentosList(prev =>
      prev.map(o =>
        o.id === selectedOrc.id
          ? {
              ...o,
              status: 'aprovado',
              statusLabel: 'Aprovado',
              statusBadgeClass:
                'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/30',
            }
          : o
      )
    );
    converterOrcamentoEmDespesa(selectedOrc.id, convertFormaPagamento as any);
    setIsModalConverterOpen(false);
  };

  const handleOpenExcluir = (orc: ExtendedOrcamento) => {
    setSelectedOrc(orc);
    setIsModalExcluirOpen(true);
  };

  const handleConfirmarExclusao = () => {
    if (!selectedOrc) return;
    setOrcamentosList(prev => prev.filter(o => o.id !== selectedOrc.id));
    setOrcamentosComparando(prev => prev.filter(id => id !== selectedOrc.id));
    setIsModalExcluirOpen(false);
  };

  const handleOpenArquivar = (orc: ExtendedOrcamento) => {
    setSelectedOrc(orc);
    setIsModalArquivarOpen(true);
  };

  const handleConfirmarArquivamento = () => {
    if (!selectedOrc) return;
    const isArquivado = selectedOrc.status === 'recusado';
    setOrcamentosList(prev =>
      prev.map(o => {
        if (o.id === selectedOrc.id) {
          if (isArquivado) {
            return {
              ...o,
              status: 'cotacao',
              statusLabel: 'Cotação',
              statusBadgeClass:
                'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
            };
          } else {
            return {
              ...o,
              status: 'recusado',
              statusLabel: 'Arquivado',
              statusBadgeClass:
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
            };
          }
        }
        return o;
      })
    );
    setIsModalArquivarOpen(false);
  };

  const handleAdicionarItemNovo = () => {
    setNovoItens(prev => [
      ...prev,
      { nome: 'AREIA MÉDIA LAVADA', qtd: '1', preco: 0, un: 'm³' },
    ]);
  };

  const handleRemoverItemNovo = (idx: number) => {
    if (novoItens.length > 1) {
      setNovoItens(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const novoTotalGeral = useMemo(() => {
    const somaItens = novoItens.reduce((sum, it) => {
      const matchQtd = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
      return sum + matchQtd * (it.preco || 0);
    }, 0);
    const frete = novoTemFrete ? parseFloat(novoValorFrete.replace(',', '.')) || 0 : 0;
    return somaItens + frete;
  }, [novoItens, novoTemFrete, novoValorFrete]);

  const handleSalvarNovoOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmpresa.trim()) return;

    const dParts = novoData.split('-');
    const dataFormatada =
      dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : formatDateBR(novoData);
    const novoNum = String(orcamentosList.length + 1).padStart(2, '0');
    const freteVal = novoTemFrete ? parseFloat(novoValorFrete.replace(',', '.')) || 0 : 0;

    const newOrc: ExtendedOrcamento = {
      id: `orc-${Date.now()}`,
      num: novoNum,
      empresa: novoEmpresa.trim().toUpperCase(),
      ident: novoIdent.trim() || `COT-2026-${novoNum}`,
      data: dataFormatada,
      dataISO: novoData,
      etapa: novoEtapa,
      status: novoStatus,
      statusLabel: novoStatus === 'aprovado' ? 'Aprovado' : 'Cotação',
      statusBadgeClass:
        novoStatus === 'aprovado'
          ? 'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/30'
          : 'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
      total: novoTotalGeral,
      temFrete: novoTemFrete,
      valorFrete: freteVal,
      prazoFrete: novoPrazoFrete,
      condicoes: novoCondicoes.trim().toUpperCase() || 'À VISTA',
      obs: novoObs.trim(),
      itens: novoItens.map((it, idx) => {
        const qNum = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
        const sub = qNum * it.preco;
        return {
          id: `item-${Date.now()}-${idx}`,
          nome: it.nome,
          materialNome: it.nome,
          qtd: `${qNum} ${it.un}`,
          quantidade: qNum,
          un: it.un,
          unidade: it.un,
          preco: it.preco,
          precoUnitarioCotado: it.preco,
          subtotal: sub,
          valorTotalCotado: sub,
        };
      }),
    };

    setOrcamentosList(prev => [newOrc, ...prev]);
    setIsModalNovoOpen(false);
    setNovoEmpresa('');
    setNovoIdent('');
    setNovoCondicoes('');
    setNovoObs('');
    setNovoTemFrete(false);
    setNovoValorFrete('');
  };

  const handleAdicionarItemEdit = () => {
    setEditItens(prev => [
      ...prev,
      { nome: 'NOVO MATERIAL', qtd: '1 un', preco: 0, un: 'un' },
    ]);
  };

  const handleRemoverItemEdit = (idx: number) => {
    if (editItens.length > 1) {
      setEditItens(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const editTotalGeral = useMemo(() => {
    const soma = editItens.reduce((sum, it) => {
      const matchQtd = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
      return sum + matchQtd * (it.preco || 0);
    }, 0);
    const frete = editTemFrete ? parseFloat(editValorFrete.replace(',', '.')) || 0 : 0;
    return soma + frete;
  }, [editItens, editTemFrete, editValorFrete]);

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrc) return;

    const dParts = editData.split('-');
    const dataFormatada =
      dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : selectedOrc.data;
    const freteVal = editTemFrete ? parseFloat(editValorFrete.replace(',', '.')) || 0 : 0;

    setOrcamentosList(prev =>
      prev.map(o => {
        if (o.id === selectedOrc.id) {
          return {
            ...o,
            empresa: editEmpresa.trim().toUpperCase(),
            ident: editIdent.trim(),
            data: dataFormatada,
            dataISO: editData,
            status: editStatus,
            statusLabel:
              editStatus === 'aprovado'
                ? 'Aprovado'
                : editStatus === 'recusado'
                ? 'Arquivado'
                : 'Cotação',
            statusBadgeClass:
              editStatus === 'aprovado'
                ? 'bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] border border-[#4bd08b]/30'
                : editStatus === 'recusado'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-[#707a82] border border-slate-200 dark:border-slate-700',
            condicoes: editCondicoes.trim().toUpperCase(),
            obs: editObs.trim(),
            temFrete: editTemFrete,
            valorFrete: freteVal,
            prazoFrete: editPrazoFrete,
            total: editTotalGeral,
            itens: editItens.map((it, idx) => {
              const qNum = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
              const sub = qNum * it.preco;
              return {
                id: `it-${Date.now()}-${idx}`,
                nome: it.nome,
                materialNome: it.nome,
                qtd: `${qNum} ${it.un}`,
                quantidade: qNum,
                un: it.un,
                unidade: it.un,
                preco: it.preco,
                precoUnitarioCotado: it.preco,
                subtotal: sub,
                valorTotalCotado: sub,
              };
            }),
          };
        }
        return o;
      })
    );
    setIsModalEditarOpen(false);
  };

  const handleSalvarMaterialInPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoMatNome.trim()) return;
    const nomeUp = novoMatNome.trim().toUpperCase();
    const p = parseFloat(novoMatPreco.replace(',', '.')) || 0;
    setNovoItens(prev => [
      ...prev,
      { nome: nomeUp, qtd: '1', preco: p, un: novoMatUnidade },
    ]);
    setNovoMatNome('');
    setNovoMatPreco('');
    setIsModalMaterialInPlaceOpen(false);
  };

  const handleToggleComparacao = (id: string) => {
    setOrcamentosComparando(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompararDireto = (id: string) => {
    if (!orcamentosComparando.includes(id)) {
      setOrcamentosComparando(prev => [...prev, id]);
    }
    setActiveTab('comparador');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150 font-body">
      
      {/* 1. Header da Página (Desktop & Tablet) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            {activeTab === 'orcamentos'
              ? 'Compare cotações de fornecedores e converta as melhores ofertas direto em despesas.'
              : 'Cotações de materiais, confronto de preços e compras da obra.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orcamentos' ? (
            <button
              type="button"
              onClick={() => setIsModalNovoOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nova Cotação</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalJuntarOpen(true)}
                className="hidden md:inline-flex lg:hidden h-10 px-3.5 items-center gap-1.5 text-xs font-bold text-[#111c2d] dark:text-white bg-white dark:bg-[#111c2d] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">merge</span>
                <span>Juntar Cotações</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalLimparOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer active:scale-95"
                title="Remove todos os orçamentos da mesa comparativa"
              >
                <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                <span>Limpar Comparação</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Comparação Ativa no Tablet (Visível em Tablet/md) */}
      <div className="hidden md:flex lg:hidden bg-[#0085db]/10 border border-[#0085db]/25 rounded-[18px] px-4 py-3 items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-[#0085db] shrink-0">
            compare_arrows
          </span>
          <p className="text-[#111c2d] dark:text-white uppercase tracking-wider text-[11px] truncate">
            <strong className="font-extrabold text-[#0085db]">
              {orcamentosAtivosNoComparador.length} FORNECEDORES COMPARADOS
            </strong>{' '}
            · ECONOMIA DE {formatBRL(kpisComparador.diferenca)} IDENTIFICADA
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('comparador')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0085db] hover:text-white bg-white dark:bg-[#111c2d] hover:bg-[#0085db] border border-[#0085db]/30 rounded-lg transition-all whitespace-nowrap active:scale-95 shrink-0 cursor-pointer"
        >
          <span>VER CONFRONTO</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Tabs Switcher: Desktop & Mobile & Tablet */}
      <div className="flex items-center gap-2 border-b border-[#e6ecf1] dark:border-[#333f55] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('orcamentos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orcamentos'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Cadastrados ({orcamentosList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('comparador')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'comparador'
              ? 'bg-[#0085db] text-white shadow-sm shadow-[#0085db]/25'
              : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">scale</span>
          <span>Comparador de Preços</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: ORÇAMENTOS CADASTRADOS                             */}
      {/* ========================================================= */}
      {activeTab === 'orcamentos' && (
        <div className="space-y-6">
          
          {/* Barra de Busca & Filtros (Status, Etapa e Ordenação) */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-3.5 sm:p-4 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Campo de Busca Livre */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Pesquisar orçamento por loja, material, etapa ou número..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              />
            </div>

            {/* Filtros Selecionáveis */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-8 text-xs font-semibold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="todos">Todos os Status</option>
                <option value="cotacao">Em Cotação</option>
                <option value="aprovado">Aprovados</option>
                <option value="recusado">Arquivados</option>
              </select>

              <select
                value={etapaFilter}
                onChange={e => {
                  setEtapaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="hidden sm:inline-block h-9 pl-3 pr-8 text-xs font-semibold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="todas">Todas as Etapas</option>
                <option value="Fundação & Estrutura">Fundação & Estrutura</option>
                <option value="Alvenaria & Fechamento">Alvenaria & Fechamento</option>
                <option value="Acabamento & Pintura">Acabamento & Pintura</option>
              </select>

              <select
                value={sortOption}
                onChange={e => {
                  setSortOption(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-8 text-xs font-semibold rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
              >
                <option value="recente">Mais recentes</option>
                <option value="menor-valor">Menor valor total</option>
                <option value="maior-valor">Maior valor total</option>
                <option value="antigo">Mais antigos</option>
              </select>
            </div>
          </div>

          {/* Barra de Paginação Solta e em Cima */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] px-4 py-3 flex items-center justify-between shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
            <div className="text-xs text-[#707a82] dark:text-[#7c8fac]">
              Exibindo <strong className="text-[#111c2d] dark:text-white">{filteredOrcamentos.length}</strong> cotações cadastradas · Página{' '}
              <strong className="text-[#111c2d] dark:text-white">{safeCurrentPage}</strong> de{' '}
              <strong className="text-[#111c2d] dark:text-white">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                title="Página Anterior"
                className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      p === safeCurrentPage
                        ? 'bg-[#0085db] text-white shadow-xs transform scale-105'
                        : 'text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] hover:text-[#111c2d] dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                title="Próxima Página"
                className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VISUALIZAÇÃO DESKTOP: CARDS LARGOS (hidden md:hidden lg:flex) */}
          {/* ========================================================= */}
          <div className="hidden lg:flex flex-col gap-4">
            {paginatedOrcamentos.map(orc => {
              const isArquivado = orc.status === 'recusado';
              return (
                <div
                  key={orc.id}
                  className="group bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] hover:border-[#0085db]/40 rounded-[20px] p-5 shadow-[0px_4px_12px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-row items-center justify-between gap-5 transition-all"
                >
                  {/* Coluna 1: Dados do Fornecedor e Identificação */}
                  <div className="w-1/3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0085db] dark:text-[#53b9ea] bg-[#0085db]/10 dark:bg-[#0085db]/20 px-2 py-0.5 rounded-md border border-[#0085db]/25 font-mono">
                        {orc.num}
                      </span>
                      {orc.etapa && (
                        <span className="text-[10px] font-semibold text-[#707a82] bg-[#f6f9fc] dark:bg-[#1a2535] px-2 py-0.5 rounded-md border border-[#e6ecf1] dark:border-[#333f55]">
                          {orc.etapa}
                        </span>
                      )}
                      <span className="text-xs text-[#707a82]">{orc.data}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${orc.statusBadgeClass}`}>
                        {orc.statusLabel}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-[#111c2d] dark:text-white uppercase truncate max-w-[320px]" title={orc.empresa}>
                      {orc.empresa}
                    </h2>

                    <div className="text-[11px] text-[#707a82] space-y-0.5">
                      <p className="truncate max-w-[320px] uppercase" title={orc.condicoes}>
                        CONDIÇÕES: <strong className="text-[#111c2d] dark:text-white">{orc.condicoes}</strong>
                      </p>
                      {orc.obs && (
                        <p className="italic truncate max-w-[320px]" title={orc.obs}>
                          Obs: {orc.obs}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Itens Cotados em Linhas Empilhadas */}
                  <div className="flex-1 flex flex-col gap-1.5 py-0 px-4 border-x border-[#e6ecf1] dark:border-[#333f55]">
                    <div className="flex items-center justify-between text-[11px] text-[#707a82] px-1 font-medium">
                      <span>Itens cotados</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
                        {orc.itens.length} itens
                      </span>
                    </div>
                    {orc.itens.slice(0, 3).map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#f0f5f9]/60 dark:bg-[#16253a]/40 border border-[#e6ecf1]/60 dark:border-[#333f55]/60 text-xs"
                      >
                        <span className="font-medium text-[#111c2d] dark:text-[#7c8fac] truncate pr-2">
                          {it.qtd} {it.nome || it.materialNome}
                        </span>
                        <span className="font-bold text-[#111c2d] dark:text-white tabular-nums shrink-0">
                          {formatBRL(it.preco || it.precoUnitarioCotado)}/un
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Coluna 3: Valor Total + Ações */}
                  <div className="w-auto shrink-0 flex flex-col items-end justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-[#707a82] font-semibold uppercase tracking-wider block">
                          Total Cotado
                        </span>
                        <span className={`text-xl font-extrabold tabular-nums ${orc.status === 'aprovado' ? 'text-[#10bd9d]' : 'text-[#111c2d] dark:text-white'}`}>
                          {formatBRL(orc.total)}
                        </span>
                      </div>

                      {/* Botões de Ação Visualizar, Editar e Excluir */}
                      <div className="flex items-center gap-1 pl-2 border-l border-[#e6ecf1] dark:border-[#333f55]">
                        <button
                          type="button"
                          onClick={() => handleOpenDetalhes(orc)}
                          className="w-8 h-8 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#0085db]/10 text-[#707a82] hover:text-[#0085db] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-center transition-colors cursor-pointer"
                          title="Visualizar todos os itens do orçamento"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditar(orc)}
                          className="w-8 h-8 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#0085db]/10 text-[#707a82] hover:text-[#0085db] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar orçamento"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenExcluir(orc)}
                          className="w-8 h-8 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#707a82] hover:text-rose-600 border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-center transition-colors cursor-pointer"
                          title="Excluir orçamento"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Botões Comprar, Arquivar e Comparar */}
                    <div className="flex items-center gap-2">
                      {!isArquivado ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenConverter(orc)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                            title="Transforma este orçamento em despesa real sem duplicar valores"
                          >
                            <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                            <span>Comprar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenArquivar(orc)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#707a82] hover:text-[#111c2d] dark:hover:text-white bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#253248] active:scale-95 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] transition-all cursor-pointer whitespace-nowrap"
                            title="Arquivar este orçamento"
                          >
                            <span className="material-symbols-outlined text-[15px]">archive</span>
                            <span>Arquivar</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenArquivar(orc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0085db] dark:text-[#53b9ea] hover:text-[#006bb3] bg-[#0085db]/10 hover:bg-[#0085db]/20 active:scale-95 rounded-xl border border-[#0085db]/25 transition-all cursor-pointer whitespace-nowrap"
                          title="Desarquivar este orçamento e restaurar as ações"
                        >
                          <span className="material-symbols-outlined text-[15px]">unarchive</span>
                          <span>Desarquivar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCompararDireto(orc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0085db] dark:text-[#53b9ea] bg-[#0085db]/10 hover:bg-[#0085db]/20 active:scale-95 rounded-xl border border-[#0085db]/25 transition-all cursor-pointer whitespace-nowrap"
                        title="Comparar este orçamento com outros fornecedores"
                      >
                        <span className="material-symbols-outlined text-[15px]">scale</span>
                        <span>Comparar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* VISUALIZAÇÃO TABLET: CARD-TABLE (hidden md:flex lg:hidden)*/}
          {/* ========================================================= */}
          <div className="hidden md:flex lg:hidden flex-col bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">request_quote</span>
                <h2 className="text-sm font-bold text-[#111c2d] dark:text-white leading-none uppercase tracking-wider">
                  COTAÇÕES DE MATERIAIS
                </h2>
              </div>
              <p className="text-[11px] text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider font-semibold">
                VALOR TOTAL COTADO:{' '}
                <strong className="text-[#0085db] font-bold">{formatBRL(totalValorCotado)}</strong>
              </p>
            </div>

            <div className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
              {paginatedOrcamentos.map(orc => {
                const isArquivado = orc.status === 'recusado';
                return (
                  <div
                    key={orc.id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-[#f6f9fc]/50 dark:hover:bg-[#1a2535]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center font-black text-xs shrink-0">
                        #{orc.num}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                            {orc.empresa}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${orc.statusBadgeClass}`}>
                            {orc.statusLabel}
                          </span>
                          {orc.temFrete && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#0085db] bg-[#0085db]/10 px-2 py-0.5 rounded-md font-semibold">
                              <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                              Frete {orc.valorFrete && orc.valorFrete > 0 ? formatBRL(orc.valorFrete) : 'Grátis'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#707a82]">
                          <span className="font-mono text-[#0085db] font-semibold">{orc.ident}</span>
                          <span>•</span>
                          <span>{orc.data}</span>
                          <span>•</span>
                          <span>{orc.itens.length} materiais cotados</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#707a82] block">
                          Valor Total
                        </span>
                        <span className="text-base font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight">
                          {formatBRL(orc.total)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetalhes(orc)}
                          className="w-8 h-8 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Visualizar detalhes"
                        >
                          <span className="material-symbols-outlined text-[17px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditar(orc)}
                          className="w-8 h-8 rounded-lg text-[#707a82] hover:text-[#0085db] hover:bg-[#0085db]/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar orçamento e frete"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenConverter(orc)}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold text-white bg-[#10bd9d] hover:bg-[#0da68a] inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                          title="Converter em compra"
                        >
                          <span className="material-symbols-outlined text-[15px]">shopping_cart_checkout</span>
                          <span>Comprar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenArquivar(orc)}
                          className="w-8 h-8 rounded-lg text-[#707a82] hover:text-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title={isArquivado ? 'Desarquivar' : 'Arquivar'}
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            {isArquivado ? 'unarchive' : 'archive'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenExcluir(orc)}
                          className="w-8 h-8 rounded-lg text-[#707a82] hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* VISUALIZAÇÃO MOBILE: CARDS TOUCH (flex md:hidden)         */}
          {/* ========================================================= */}
          <div className="flex md:hidden flex-col space-y-3">
            {paginatedOrcamentos.map(orc => {
              const isArquivado = orc.status === 'recusado';
              return (
                <div
                  key={orc.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#0085db] bg-[#0085db]/10 px-1.5 py-0.5 rounded font-mono">
                        {orc.num}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${orc.statusBadgeClass}`}>
                        {orc.statusLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#707a82]">{orc.data}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                      {orc.empresa}
                    </h3>
                    <p className="text-[10px] text-[#707a82] truncate uppercase mt-0.5">
                      {orc.condicoes}
                    </p>
                  </div>

                  {/* Resumo dos itens */}
                  <div className="p-2 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-1 text-[11px]">
                    {orc.itens.slice(0, 2).map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <span className="truncate text-[#707a82]">
                          {i.qtd} {i.nome || i.materialNome}
                        </span>
                        <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                          {formatBRL(i.preco || i.precoUnitarioCotado)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#e6ecf1] dark:border-[#333f55]">
                    <div>
                      <span className="text-[9px] text-[#707a82] uppercase tracking-wider block font-semibold">
                        Total
                      </span>
                      <span className="text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(orc.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isArquivado ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenConverter(orc)}
                            className="h-7 px-2.5 text-[11px] font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] active:scale-95 rounded-lg flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">shopping_cart</span>
                            <span>Comprar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenArquivar(orc)}
                            className="h-7 w-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] flex items-center justify-center"
                            title="Arquivar"
                          >
                            <span className="material-symbols-outlined text-[14px]">archive</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenArquivar(orc)}
                          className="h-7 px-2.5 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 rounded-lg flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">unarchive</span>
                          <span>Desarquivar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditar(orc)}
                        className="h-7 w-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] flex items-center justify-center"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenExcluir(orc)}
                        className="h-7 w-7 rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-rose-500 flex items-center justify-center"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: COMPARADOR DINÂMICO DE PREÇOS LADO A LADO          */}
      {/* ========================================================= */}
      {activeTab === 'comparador' && (
        <div className="space-y-6">
          
          {/* 4 Cards de Métricas Comparativas (Desktop & Tablet) */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Orçamentos Selecionados */}
            <div className="p-4 rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#707a82]">Orçamentos Selecionados</span>
                <span className="w-8 h-8 rounded-lg bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#111c2d] dark:text-white">
                  {orcamentosAtivosNoComparador.length}
                </span>
                <span className="text-xs text-[#707a82]">em confronto</span>
              </div>
              <span className="text-[11px] text-[#707a82] mt-0.5 block">
                {matrixMateriais.length} materiais cotados
              </span>
            </div>

            {/* 2. Menor Valor Global */}
            <div className="p-4 rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#707a82]">Menor Valor Global</span>
                <span className="w-8 h-8 rounded-lg bg-[#4bd08b]/15 text-[#10bd9d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-[#10bd9d] tabular-nums">
                  {formatBRL(kpisComparador.menor)}
                </span>
              </div>
              <span className="text-[11px] text-[#10bd9d] font-bold block truncate uppercase">
                {kpisComparador.lojaVencedora}
              </span>
            </div>

            {/* 3. Maior Cotação Confrontada */}
            <div className="p-4 rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#707a82]">Maior Cotação Confrontada</span>
                <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </span>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-[#111c2d] dark:text-white tabular-nums">
                  {formatBRL(kpisComparador.maior)}
                </span>
              </div>
              <span className="text-[11px] text-[#707a82] block truncate uppercase">
                {kpisComparador.lojaMaior}
              </span>
            </div>

            {/* 4. Diferença / Economia */}
            <div className="p-4 rounded-[18px] bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-[0px_2px_6px_rgba(37,83,185,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#707a82]">Diferença / Economia</span>
                <span className="w-8 h-8 rounded-lg bg-[#4bd08b]/15 text-[#10bd9d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">savings</span>
                </span>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-black text-[#10bd9d] tabular-nums">
                  {formatBRL(kpisComparador.diferenca)}
                </span>
              </div>
              <span className="text-[11px] text-[#10bd9d] font-bold block">
                {kpisComparador.percentualEconomia.toFixed(1)}% de redução
              </span>
            </div>
          </div>

          {/* Top KPIs Mobile (2 Cards Compactos) */}
          <div className="grid sm:hidden grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xs">
              <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider block">
                Menor Valor Global
              </span>
              <span className="text-base font-black text-[#10bd9d] tabular-nums mt-0.5 block">
                {formatBRL(kpisComparador.menor)}
              </span>
              <span className="text-[9px] font-bold text-[#10bd9d] truncate block uppercase mt-0.5">
                {kpisComparador.lojaVencedora}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] shadow-xs">
              <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider block">
                Economia Potencial
              </span>
              <span className="text-base font-black text-[#10bd9d] tabular-nums mt-0.5 block">
                {formatBRL(kpisComparador.diferenca)}
              </span>
              <span className="text-[9px] text-[#707a82] truncate block uppercase mt-0.5">
                Diferença máx.
              </span>
            </div>
          </div>

          {/* Painel: Orçamentos Selecionados para Comparar */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-4 sm:p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0085db]">
                    compare_arrows
                  </span>
                  <span>Orçamentos selecionados para comparar</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db]">
                    {orcamentosAtivosNoComparador.length} selecionados
                  </span>
                </h2>
                <p className="text-xs text-[#707a82] mt-0.5">
                  Cotações ativas nesta comparação. Remova individualmente ou clique em &apos;+ Juntar&apos; para buscar outras.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalJuntarOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Juntar Cotações</span>
                </button>
              </div>
            </div>

            {/* Grid dos Selecionados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orcamentosAtivosNoComparador.map(orc => (
                <div
                  key={orc.id}
                  className="p-3.5 rounded-xl border border-[#0085db]/40 bg-[#0085db]/5 dark:bg-[#0085db]/10 flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#0085db] font-mono">#{orc.num}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${orc.statusBadgeClass}`}>
                        {orc.statusLabel}
                      </span>
                      <span className="text-[10px] text-[#707a82]">{orc.data}</span>
                    </div>
                    <h4 className="font-bold text-[#111c2d] dark:text-white truncate uppercase" title={orc.empresa}>
                      {orc.empresa}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-[10px] text-[#707a82]">Total:</span>
                      <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                        {formatBRL(orc.total)}
                      </span>
                      <span className="text-[10px] text-[#707a82]">· {orc.itens.length} itens</span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleToggleComparacao(orc.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                      title="Remover desta comparação"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Lado a Lado (Desktop & Tablet) */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {orcamentosAtivosNoComparador.map(orc => {
              const isVencedor =
                orc.total === kpisComparador.menor && orcamentosAtivosNoComparador.length > 1;

              return (
                <div
                  key={orc.id}
                  className={`relative rounded-[20px] p-5 border ${
                    isVencedor
                      ? 'border-2 border-[#10bd9d] bg-white dark:bg-[#111c2d] shadow-md shadow-[#10bd9d]/10'
                      : 'border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] shadow-xs'
                  } flex flex-col justify-between gap-4 transition-all`}
                >
                  {isVencedor && (
                    <div className="absolute top-0 right-0 bg-[#10bd9d] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider">
                      MENOR PREÇO
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#0085db] dark:text-[#53b9ea] bg-[#0085db]/10 px-2 py-0.5 rounded-md font-mono">
                          #{orc.num}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${orc.statusBadgeClass}`}>
                          {orc.statusLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleComparacao(orc.id)}
                        className="w-7 h-7 rounded-lg text-[#707a82] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remover da comparação"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase truncate" title={orc.empresa}>
                        {orc.empresa}
                      </h3>
                      <span className="text-[11px] text-[#707a82]">Cotado em {orc.data}</span>
                    </div>

                    <div className="text-[11px] text-[#707a82] pt-1">
                      <p className="truncate uppercase text-[10px]">
                        COND: <strong className="text-[#111c2d] dark:text-white">{orc.condicoes}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-[#e6ecf1] dark:border-[#333f55]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-[#707a82] text-[10px]">
                        Itens cotados
                      </span>
                      <span className="font-bold text-[#707a82] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                        {orc.itens.length} itens
                      </span>
                    </div>
                    <div className="space-y-1">
                      {orc.itens.slice(0, 3).map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#f0f5f9]/60 dark:bg-[#16253a]/40 text-xs"
                        >
                          <span className="font-medium text-[#111c2d] dark:text-[#7c8fac] truncate pr-2">
                            {it.qtd} {it.nome || it.materialNome}
                          </span>
                          <span className="font-bold text-[#111c2d] dark:text-white tabular-nums shrink-0">
                            {formatBRL(it.preco || it.precoUnitarioCotado)}/un
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-[#707a82] uppercase tracking-wider block font-semibold">
                        Total Cotado
                      </span>
                      <span
                        className={`text-lg font-extrabold ${
                          isVencedor ? 'text-[#10bd9d]' : 'text-[#111c2d] dark:text-white'
                        } tabular-nums`}
                      >
                        {formatBRL(orc.total)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenConverter(orc)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white ${
                        isVencedor ? 'bg-[#10bd9d] hover:bg-[#0da68a]' : 'bg-[#4bd08b] hover:bg-[#10bd9d]'
                      } active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap`}
                      title="Comprar proposta"
                    >
                      <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carrossel Deslizante Mobile (snap-x) */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#707a82] uppercase tracking-wider">
                Deslize para ver todas as cotações:
              </span>
              <span className="text-[10px] font-bold text-[#0085db] tabular-nums">
                {orcamentosAtivosNoComparador.length} reunidas
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
              {orcamentosAtivosNoComparador.map(orc => {
                const isVencedor =
                  orc.total === kpisComparador.menor && orcamentosAtivosNoComparador.length > 1;

                return (
                  <div
                    key={orc.id}
                    className={`snap-center shrink-0 w-[85%] p-4 rounded-2xl bg-white dark:bg-[#111c2d] border ${
                      isVencedor
                        ? 'border-2 border-[#10bd9d] shadow-md shadow-[#10bd9d]/15'
                        : 'border border-[#e6ecf1] dark:border-[#333f55]'
                    } flex flex-col justify-between space-y-3`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#0085db] bg-[#0085db]/10 px-1.5 py-0.5 rounded font-mono">
                          #{orc.num}
                        </span>
                        {isVencedor ? (
                          <span className="text-[9px] font-black uppercase text-white bg-[#10bd9d] px-2 py-0.5 rounded-full">
                            Melhor Preço
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold uppercase ${orc.statusBadgeClass} px-2 py-0.5 rounded-full`}>
                            {orc.statusLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                        {orc.empresa}
                      </h4>
                      <p className="text-[10px] text-[#707a82] uppercase truncate mt-0.5">
                        COND: {orc.condicoes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
                      <div>
                        <span className="text-[9px] text-[#707a82] uppercase block font-semibold">
                          Total
                        </span>
                        <span
                          className={`text-sm font-black ${
                            isVencedor ? 'text-[#10bd9d]' : 'text-[#111c2d] dark:text-white'
                          } tabular-nums`}
                        >
                          {formatBRL(orc.total)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenConverter(orc)}
                        className="h-7 px-3 text-xs font-bold text-white bg-[#4bd08b] rounded-lg cursor-pointer"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confronto Item a Item dos Orçamentos Reunidos */}
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[20px] p-4 sm:p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">table_rows</span>
                <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                  CONFRONTO ITEM A ITEM
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#10bd9d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>{kpisComparador.lojaVencedora} lidera com menor valor</span>
              </span>
            </div>

            {/* Tabela Desktop & Tablet */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] font-bold text-[11px] uppercase tracking-wider">
                    <th className="pb-3 w-1/3">Material</th>
                    <th className="pb-3 text-center w-16">Qtd</th>
                    {orcamentosAtivosNoComparador.map(orc => (
                      <th key={orc.id} className="pb-3 text-right">
                        <span className="truncate block" title={orc.empresa}>
                          {orc.empresa.split(' ')[0]} {orc.empresa.split(' ')[1] || ''}
                        </span>
                      </th>
                    ))}
                    <th className="pb-3 text-right text-[#10bd9d] bg-[#10bd9d]/5 px-2 rounded-t-lg">
                      Menor Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
                  {matrixMateriais.map((mat, idx) => {
                    const precos = orcamentosAtivosNoComparador
                      .map(o => {
                        const it = o.itens.find(i => (i.nome || i.materialNome) === mat.nome);
                        return it ? { id: o.id, preco: it.preco || it.precoUnitarioCotado, sub: it.subtotal } : null;
                      })
                      .filter(Boolean);

                    const menorPreco =
                      precos.length > 0 ? Math.min(...precos.map(p => p!.preco)) : 0;

                    return (
                      <tr key={idx} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors">
                        <td className="py-3 font-semibold text-[#111c2d] dark:text-white uppercase">
                          {mat.nome}
                        </td>
                        <td className="py-3 text-center text-[#707a82] font-semibold">
                          {mat.un}
                        </td>
                        {orcamentosAtivosNoComparador.map(orc => {
                          const it = orc.itens.find(i => (i.nome || i.materialNome) === mat.nome);
                          if (!it) {
                            return (
                              <td key={orc.id} className="py-3 text-right text-[#707a82]">
                                —
                              </td>
                            );
                          }
                          const isMenor = (it.preco || it.precoUnitarioCotado) === menorPreco;
                          return (
                            <td
                              key={orc.id}
                              className={`py-3 text-right font-medium tabular-nums ${
                                isMenor ? 'font-bold text-[#10bd9d] bg-[#10bd9d]/5' : 'text-[#111c2d] dark:text-white'
                              }`}
                            >
                              {formatBRL(it.preco || it.precoUnitarioCotado)} {isMenor ? '★' : ''}
                            </td>
                          );
                        })}
                        <td className="py-3 text-right font-black text-[#10bd9d] bg-[#10bd9d]/10 px-2 tabular-nums">
                          {formatBRL(menorPreco)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totalizador Geral */}
                  <tr className="font-extrabold text-xs bg-[#f8fafc] dark:bg-[#16253b]">
                    <td className="py-3 uppercase text-[#111c2d] dark:text-white">TOTAL FINAL</td>
                    <td className="py-3 text-center text-[#707a82]">
                      {matrixMateriais.length} itens
                    </td>
                    {orcamentosAtivosNoComparador.map(orc => {
                      const isVencedor = orc.total === kpisComparador.menor;
                      return (
                        <td
                          key={orc.id}
                          className={`py-3 text-right tabular-nums ${
                            isVencedor ? 'text-[#10bd9d] bg-[#10bd9d]/15 font-black text-sm' : 'text-[#111c2d] dark:text-white'
                          }`}
                        >
                          {formatBRL(orc.total)}
                        </td>
                      );
                    })}
                    <td className="py-3 text-right text-[#10bd9d] bg-[#10bd9d]/20 px-2 font-black text-sm tabular-nums">
                      {formatBRL(kpisComparador.menor)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Confronto Slim Mobile */}
            <div className="sm:hidden space-y-2">
              {matrixMateriais.map((mat, idx) => {
                const precos = orcamentosAtivosNoComparador
                  .map(o => {
                    const it = o.itens.find(i => (i.nome || i.materialNome) === mat.nome);
                    return it ? { orc: o, preco: it.preco || it.precoUnitarioCotado } : null;
                  })
                  .filter(Boolean);

                const menorPreco =
                  precos.length > 0 ? Math.min(...precos.map(p => p!.preco)) : 0;

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#111c2d] dark:text-white uppercase text-[11px] truncate max-w-[180px]">
                        {mat.nome}
                      </span>
                      <span className="font-extrabold text-[#10bd9d] text-xs tabular-nums">
                        Menor: {formatBRL(menorPreco)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#e6ecf1]/60 dark:border-[#333f55]/60 text-[10px]">
                      {orcamentosAtivosNoComparador.map(o => {
                        const it = o.itens.find(i => (i.nome || i.materialNome) === mat.nome);
                        if (!it) {
                          return (
                            <span key={o.id} className="text-[#707a82] text-center">
                              —
                            </span>
                          );
                        }
                        const isMin = (it.preco || it.precoUnitarioCotado) === menorPreco;
                        return (
                          <div
                            key={o.id}
                            className={`text-center p-1 rounded ${
                              isMin ? 'bg-[#4bd08b]/15 text-[#10bd9d] font-bold' : 'text-[#707a82]'
                            }`}
                          >
                            <span className="block truncate text-[9px] uppercase font-semibold">
                              {o.num}
                            </span>
                            <span className="tabular-nums">
                              {formatBRL(it.preco || it.precoUnitarioCotado)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NOVA COTAÇÃO                                     */}
      {/* ========================================================= */}
      {isModalNovoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalNovoOpen(false)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Nova Cotação
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Cadastre a cotação de um fornecedor para confrontar preços.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalNovoOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSalvarNovoOrcamento} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Fornecedor / Loja *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comercial Silva, Depósito Central..."
                    value={novoEmpresa}
                    onChange={e => setNovoEmpresa(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Número da Cotação / Proposta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: COT-2026-042"
                    value={novoIdent}
                    onChange={e => setNovoIdent(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Etapa da Obra *
                  </label>
                  <select
                    value={novoEtapa}
                    onChange={e => setNovoEtapa(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Fundação & Estrutura">Fundação & Estrutura</option>
                    <option value="Alvenaria & Fechamento">Alvenaria & Fechamento</option>
                    <option value="Acabamento & Pintura">Acabamento & Pintura</option>
                    <option value="Instalações Elétricas & Hidráulicas">Instalações Elétricas & Hidráulicas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Data da Cotação *
                  </label>
                  <input
                    type="date"
                    required
                    value={novoData}
                    onChange={e => setNovoData(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                  Condições Comerciais / Pagamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: 3x no boleto, Pix com 5% de desconto, etc."
                  value={novoCondicoes}
                  onChange={e => setNovoCondicoes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82]"
                />
              </div>

              {/* Seção de Frete com Checkbox */}
              <div className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={novoTemFrete}
                    onChange={e => setNovoTemFrete(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db] border-[#e6ecf1] dark:border-[#333f55]"
                  />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">local_shipping</span>
                    <span>Tem valor de entrega / frete</span>
                  </span>
                </label>

                {novoTemFrete && (
                  <div className="grid grid-cols-2 gap-2 pl-6 pt-1">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-[#707a82] font-bold">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor Frete"
                        value={novoValorFrete}
                        onChange={e => setNovoValorFrete(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold tabular-nums"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Prazo (ex: 48h canteiro)"
                      value={novoPrazoFrete}
                      onChange={e => setNovoPrazoFrete(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Itens Cotados */}
              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#111c2d] dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">inventory_2</span>
                    <span>Itens da Cotação ({novoItens.length})</span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsModalMaterialInPlaceOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_box</span>
                      <span>Novo Material</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAdicionarItemNovo}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Adicionar Item</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {novoItens.map((it, idx) => {
                    const qNum = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
                    const sub = qNum * it.preco;
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-xs"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={it.nome}
                            onChange={e => {
                              const v = e.target.value.toUpperCase();
                              setNovoItens(prev =>
                                prev.map((item, i) => (i === idx ? { ...item, nome: v } : item))
                              );
                            }}
                            placeholder="Material"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-semibold"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={it.qtd}
                            onChange={e => {
                              const v = e.target.value;
                              setNovoItens(prev =>
                                prev.map((item, i) => (i === idx ? { ...item, qtd: v } : item))
                              );
                            }}
                            placeholder="Qtd"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white text-center"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            step="0.01"
                            value={it.preco || ''}
                            onChange={e => {
                              const p = parseFloat(e.target.value) || 0;
                              setNovoItens(prev =>
                                prev.map((item, i) => (i === idx ? { ...item, preco: p } : item))
                              );
                            }}
                            placeholder="R$ Unit"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold tabular-nums"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <span className="font-bold text-[#111c2d] dark:text-white tabular-nums text-xs">
                            {formatBRL(sub)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoverItemNovo(idx)}
                            className="text-[#707a82] hover:text-rose-500 cursor-pointer p-0.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl flex justify-between items-center text-xs border border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="font-medium text-[#707a82] dark:text-[#7c8fac]">Total da Cotação:</span>
                  <span className="text-base font-black text-[#0085db] tabular-nums">
                    {formatBRL(novoTotalGeral)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Prazo de entrega, contatos do vendedor..."
                  value={novoObs}
                  onChange={e => setNovoObs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalNovoOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDITAR ORÇAMENTO                                 */}
      {/* ========================================================= */}
      {isModalEditarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalEditarOpen(false)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Editar Orçamento
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Altere valores, materiais, fornecedor e frete.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalEditarOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Fornecedor / Loja *
                  </label>
                  <input
                    type="text"
                    required
                    value={editEmpresa}
                    onChange={e => setEditEmpresa(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Nº Identificação
                  </label>
                  <input
                    type="text"
                    value={editIdent}
                    onChange={e => setEditIdent(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Data da Cotação
                  </label>
                  <input
                    type="date"
                    value={editData}
                    onChange={e => setEditData(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Condições Comerciais
                  </label>
                  <input
                    type="text"
                    value={editCondicoes}
                    onChange={e => setEditCondicoes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                  />
                </div>
              </div>

              {/* Seção de Frete Editável */}
              <div className="p-3 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editTemFrete}
                    onChange={e => setEditTemFrete(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0085db] focus:ring-[#0085db]"
                  />
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">local_shipping</span>
                    <span>Possui frete para canteiro</span>
                  </span>
                </label>
                {editTemFrete && (
                  <div className="grid grid-cols-2 gap-2 pl-6 pt-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor do Frete (R$)"
                      value={editValorFrete}
                      onChange={e => setEditValorFrete(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Prazo (ex: 48h)"
                      value={editPrazoFrete}
                      onChange={e => setEditPrazoFrete(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-[#111c2d] dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Itens Editáveis */}
              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase">
                    Itens Cotados ({editItens.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAdicionarItemEdit}
                    className="text-xs font-bold text-[#0085db] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {editItens.map((it, idx) => {
                    const qNum = parseFloat(it.qtd.replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
                    const sub = qNum * it.preco;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs"
                      >
                        <input
                          type="text"
                          value={it.nome}
                          onChange={e => {
                            const v = e.target.value.toUpperCase();
                            setEditItens(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, nome: v } : item))
                            );
                          }}
                          placeholder="Material"
                          className="flex-1 px-2 py-1 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] font-bold"
                        />
                        <input
                          type="text"
                          value={it.qtd}
                          onChange={e => {
                            const v = e.target.value;
                            setEditItens(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, qtd: v } : item))
                            );
                          }}
                          placeholder="Qtd"
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] text-center"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={it.preco || ''}
                          onChange={e => {
                            const p = parseFloat(e.target.value) || 0;
                            setEditItens(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, preco: p } : item))
                            );
                          }}
                          placeholder="R$ Unit"
                          className="w-24 px-2 py-1 text-xs rounded-lg border border-[#e6ecf1] dark:border-[#333f55] bg-white dark:bg-[#111c2d] font-bold tabular-nums text-right"
                        />
                        <span className="w-24 font-bold text-right tabular-nums text-xs">
                          {formatBRL(sub)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverItemEdit(idx)}
                          className="text-[#707a82] hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 bg-[#f6f9fc] dark:bg-[#1a2535] rounded-xl flex justify-between items-center text-xs border border-[#e6ecf1] dark:border-[#333f55]">
                  <span className="font-medium text-[#707a82]">Total Recalculado:</span>
                  <span className="text-base font-black text-[#0085db] tabular-nums">
                    {formatBRL(editTotalGeral)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={editObs}
                  onChange={e => setEditObs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535]"
                />
              </div>

              <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalEditarOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#707a82] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DETALHES DO ORÇAMENTO                            */}
      {/* ========================================================= */}
      {isModalDetalhesOpen && selectedOrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalDetalhesOpen(false)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-[#0085db] bg-[#0085db]/10 px-2 py-0.2 rounded-md font-mono">
                      #{selectedOrc.num}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${selectedOrc.statusBadgeClass}`}>
                      {selectedOrc.statusLabel}
                    </span>
                    <span className="text-[11px] text-[#707a82]">Cotado em {selectedOrc.data}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white uppercase">
                    {selectedOrc.empresa}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalDetalhesOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55]">
              <div>
                <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider block">
                  Condições de Pagamento
                </span>
                <span className="font-bold text-[#111c2d] dark:text-white">{selectedOrc.condicoes}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider block">
                  Observações / Frete
                </span>
                <span className="text-[#111c2d] dark:text-white">
                  {selectedOrc.obs || (selectedOrc.temFrete ? `Frete ${selectedOrc.prazoFrete || 'canteiro'}` : 'Nenhuma observação informada.')}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                  Itens da Cotação ({selectedOrc.itens.length} itens)
                </h4>
                <span className="text-xs text-[#707a82]">Valores unitários negociados</span>
              </div>

              <div className="rounded-xl border border-[#e6ecf1] dark:border-[#333f55] overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f8fafc] dark:bg-[#162232] border-b border-[#e6ecf1] dark:border-[#333f55] text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Item / Material</th>
                      <th className="py-2.5 px-2 text-center">Un.</th>
                      <th className="py-2.5 px-3 text-right">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Unitário</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55] text-xs">
                    {selectedOrc.itens.map((it, idx) => {
                      const qNum = parseFloat(String(it.qtd ?? it.quantidade).replace(/[^\d.,]/g, '').replace(',', '.')) || 1;
                      const sub = it.subtotal || qNum * (it.preco || it.precoUnitarioCotado);
                      return (
                        <tr key={idx} className="hover:bg-[#f6f9fc]/80 dark:hover:bg-[#1a2535]/80 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#111c2d] dark:text-white uppercase">
                            {it.nome || it.materialNome}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[#707a82] font-mono text-[11px]">
                            {it.un || it.unidade || 'un'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#707a82]">
                            {it.qtd || it.quantidade}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#111c2d] dark:text-[#cbd5e1] tabular-nums">
                            {formatBRL(it.preco || it.precoUnitarioCotado)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111c2d] dark:text-white tabular-nums">
                            {formatBRL(sub)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <div>
                <span className="text-[10px] text-[#707a82] uppercase tracking-wider block font-semibold">
                  Valor Total Cotado
                </span>
                <span className="text-lg font-black text-[#0085db] tabular-nums">
                  {formatBRL(selectedOrc.total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalDetalhesOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CONVERTER EM COMPRA (RESUMIDO COM FORMA DE PAGAMENTO)*/}
      {/* ========================================================= */}
      {isModalConverterOpen && selectedOrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalConverterOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4bd08b]/15 text-[#10bd9d] dark:text-[#4bd08b] flex items-center justify-center border border-[#4bd08b]/30">
                  <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Confirmar Compra
                  </h2>
                  <p className="text-[11px] text-[#707a82]">Lança a despesa no custo da obra</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalConverterOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#4bd08b]/10 dark:bg-[#4bd08b]/15 border border-[#4bd08b]/30 text-xs">
                <div className="min-w-0 pr-3">
                  <span className="block text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                    {selectedOrc.empresa}
                  </span>
                  <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                    {selectedOrc.itens.length} itens cotados
                  </span>
                </div>
                <span className="text-sm font-black text-[#10bd9d] dark:text-[#4bd08b] tabular-nums shrink-0">
                  {formatBRL(selectedOrc.total)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                  FORMA DE PAGAMENTO
                </label>
                <select
                  value={convertFormaPagamento}
                  onChange={e => setConvertFormaPagamento(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-semibold cursor-pointer"
                >
                  <option value="pix">Pix (À vista)</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalConverterOpen(false)}
                  className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarConversao}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#4bd08b] hover:bg-[#10bd9d] active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Confirmar Compra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EXCLUIR ORÇAMENTO                                */}
      {/* ========================================================= */}
      {isModalExcluirOpen && selectedOrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalExcluirOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Excluir orçamento
                  </h2>
                  <p className="text-[11px] text-[#707a82]">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalExcluirOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs">
                <div className="min-w-0 pr-3">
                  <span className="block text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                    {selectedOrc.empresa}
                  </span>
                  <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                    {selectedOrc.itens.length} itens cotados
                  </span>
                </div>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                  {formatBRL(selectedOrc.total)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalExcluirOpen(false)}
                  className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarExclusao}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: ARQUIVAR / DESARQUIVAR                           */}
      {/* ========================================================= */}
      {isModalArquivarOpen && selectedOrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalArquivarOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#707a82] flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedOrc.status === 'recusado' ? 'unarchive' : 'archive'}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    {selectedOrc.status === 'recusado' ? 'Desarquivar orçamento' : 'Arquivar orçamento'}
                  </h2>
                  <p className="text-[11px] text-[#707a82]">
                    {selectedOrc.status === 'recusado'
                      ? 'O orçamento voltará para a lista ativa'
                      : 'Você poderá desarquivá-lo quando quiser'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalArquivarOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#162232] border border-[#e6ecf1] dark:border-[#333f55] text-xs">
                <div className="min-w-0 pr-3">
                  <span className="block text-xs font-bold text-[#111c2d] dark:text-white uppercase truncate">
                    {selectedOrc.empresa}
                  </span>
                  <span className="text-[11px] text-[#707a82] dark:text-[#7c8fac]">
                    {selectedOrc.itens.length} itens cotados
                  </span>
                </div>
                <span className="text-sm font-black text-[#111c2d] dark:text-white tabular-nums shrink-0">
                  {formatBRL(selectedOrc.total)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalArquivarOpen(false)}
                  className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarArquivamento}
                  className={`h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white ${
                    selectedOrc.status === 'recusado'
                      ? 'bg-[#0085db] hover:bg-[#0074bf]'
                      : 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600'
                  } active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedOrc.status === 'recusado' ? 'unarchive' : 'archive'}
                  </span>
                  <span>{selectedOrc.status === 'recusado' ? 'Desarquivar' : 'Arquivar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: JUNTAR ORÇAMENTOS PARA COMPARAR                  */}
      {/* ========================================================= */}
      {isModalJuntarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalJuntarOpen(false)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div>
                <h3 className="text-base font-bold text-[#111c2d] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0085db]">library_add</span>
                  <span>Juntar Orçamentos para Comparar</span>
                </h3>
                <p className="text-xs text-[#707a82] mt-0.5">
                  Pesquise qualquer cotação cadastrada (inclusive arquivadas) e adicione à mesa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalJuntarOpen(false)}
                className="w-8 h-8 rounded-lg text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a82]">
                  search
                </span>
                <input
                  type="text"
                  value={juntarSearch}
                  onChange={e => setJuntarSearch(e.target.value)}
                  placeholder="Pesquisar por nome, valor, data, itens..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82]"
                />
              </div>

              <select
                value={juntarSort}
                onChange={e => setJuntarSort(e.target.value as any)}
                className="px-3 py-2.5 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-medium cursor-pointer"
              >
                <option value="recente">Mais recente → Antigo</option>
                <option value="antigo">Mais antigo → Recente</option>
                <option value="menor_valor">Menor valor total</option>
                <option value="maior_valor">Maior valor total</option>
              </select>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {orcamentosList
                .filter(o => {
                  const q = juntarSearch.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    o.empresa.toLowerCase().includes(q) ||
                    o.ident.toLowerCase().includes(q) ||
                    o.data.includes(q) ||
                    o.total.toString().includes(q)
                  );
                })
                .sort((a, b) => {
                  if (juntarSort === 'antigo') return new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime();
                  if (juntarSort === 'menor_valor') return a.total - b.total;
                  if (juntarSort === 'maior_valor') return b.total - a.total;
                  return new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime();
                })
                .map(orc => {
                  const isChecked = orcamentosComparando.includes(orc.id);
                  return (
                    <div
                      key={orc.id}
                      className={`p-3.5 rounded-xl border ${
                        isChecked
                          ? 'border-[#0085db] bg-[#0085db]/5 dark:bg-[#0085db]/10'
                          : 'border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535]'
                      } flex items-center justify-between gap-3 text-xs transition-all`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#0085db] font-mono">#{orc.num}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${orc.statusBadgeClass}`}>
                            {orc.statusLabel}
                          </span>
                          <span className="text-[10px] text-[#707a82]">{orc.data}</span>
                        </div>
                        <h4 className="font-bold text-[#111c2d] dark:text-white truncate uppercase">
                          {orc.empresa}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-[10px] text-[#707a82]">Total:</span>
                          <span className="font-bold text-[#111c2d] dark:text-white tabular-nums">
                            {formatBRL(orc.total)}
                          </span>
                          <span className="text-[10px] text-[#707a82]">· {orc.itens.length} itens</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleComparacao(orc.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          isChecked
                            ? 'text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50'
                            : 'text-white bg-[#0085db] border-transparent hover:bg-[#0074bf]'
                        }`}
                      >
                        {isChecked ? 'Remover' : 'Juntar'}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e6ecf1] dark:border-[#333f55]">
              <span className="text-xs text-[#707a82] font-semibold">
                {orcamentosComparando.length} orçamentos na comparação atual
              </span>
              <button
                type="button"
                onClick={() => setIsModalJuntarOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074bf] rounded-xl shadow-xs cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: LIMPAR COMPARAÇÃO                                */}
      {/* ========================================================= */}
      {isModalLimparOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalLimparOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Limpar Comparação
                  </h2>
                  <p className="text-[11px] text-[#707a82]">Comparador de orçamentos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalLimparOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Tem certeza que deseja limpar todos os orçamentos selecionados para comparação?
              </p>

              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalLimparOpen(false)}
                  className="h-9 px-3.5 inline-flex items-center justify-center text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrcamentosComparando([]);
                    setIsModalLimparOpen(false);
                  }}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Limpar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 9: CADASTRAR MATERIAL IN-PLACE                     */}
      {/* ========================================================= */}
      {isModalMaterialInPlaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#111c2d]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalMaterialInPlaceOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[24px] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">
                    Cadastrar Material
                  </h3>
                  <p className="text-[11px] text-[#707a82]">Adicione à lista para cotações futuras</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMaterialInPlaceOpen(false)}
                className="w-8 h-8 rounded-full text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSalvarMaterialInPlace} className="space-y-3 pt-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                  Nome do Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tinta Acrílica Fosca 18L"
                  value={novoMatNome}
                  onChange={e => setNovoMatNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Unidade de Medida
                  </label>
                  <select
                    value={novoMatUnidade}
                    onChange={e => setNovoMatUnidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white font-medium cursor-pointer"
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="sc">sc (Saco)</option>
                    <option value="m³">m³ (Metro Cúbico)</option>
                    <option value="m²">m² (Metro Quadrado)</option>
                    <option value="barra">barra (Barra 12m)</option>
                    <option value="kg">kg (Quilograma)</option>
                    <option value="lata">lata (Lata 18L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1 uppercase tracking-wider">
                    Preço Estimado R$
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={novoMatPreco}
                    onChange={e => setNovoMatPreco(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white placeholder-[#707a82] font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalMaterialInPlaceOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#707a82] hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
                >
                  Cadastrar e Inserir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

