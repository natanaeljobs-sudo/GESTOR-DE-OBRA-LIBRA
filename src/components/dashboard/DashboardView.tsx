import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR } from '../../utils/date';

export const DashboardView: React.FC = () => {
  const {
    activeObra,
    totalGeralObra,
    totaisPorCategoria,
    totalMaoDeObra,
    totalAPagar,
    totalTrilhosProduzidos,
    totalPlacasProduzidas,
    custoIndicativoTrilho,
    despesas,
    diarias,
    cartoes,
    materiais,
    navigateToTabWithFilter,
  } = useApp();

  // Estados de Modais
  const [showModalCategorias, setShowModalCategorias] = useState(false);
  const [showModalSemanas, setShowModalSemanas] = useState(false);

  // Estados de Paginação Local dos Cards
  const [paginaMateriais, setPaginaMateriais] = useState(1);
  const [paginaCategorias, setPaginaCategorias] = useState(1);
  const [paginaSemanas, setPaginaSemanas] = useState(1);
  const [paginaCompras, setPaginaCompras] = useState(1);
  const [paginaDiarias, setPaginaDiarias] = useState(1);
  const [paginaEtapas, setPaginaEtapas] = useState(1);

  // 1. Cálculo do Tempo Atual da Obra (Dias corridos)
  const tempoObra = useMemo(() => {
    const dataInicio = new Date(activeObra.dataInicio ? `${activeObra.dataInicio}T07:00:00` : '2026-09-01T07:00:00');
    const hoje = new Date();
    const diffMs = Math.max(0, hoje.getTime() - dataInicio.getTime());
    const dias = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const diaFmt = String(hoje.getDate()).padStart(2, '0');
    const mesFmt = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoFmt = hoje.getFullYear();
    return {
      dias,
      sub: `DE ${formatDateBR(activeObra.dataInicio || '2026-09-01')} ATÉ ${diaFmt}/${mesFmt}/${anoFmt}`,
    };
  }, [activeObra.dataInicio]);

  // 2. Materiais Comprados Agrupados das Despesas / Catálogo
  const materiaisComprados = useMemo(() => {
    const mapa = new Map<string, { nome: string; categoria: string; cor: string; quantidade: number; unidade: string; valorTotal: number }>();

    // Varre itens de todas as despesas para totalizar quantidade e valor por material
    despesas.forEach(d => {
      if (d.itens && d.itens.length > 0) {
        d.itens.forEach(it => {
          const nomeKey = it.descricao.trim().toUpperCase();
          const existente = mapa.get(nomeKey) || {
            nome: it.descricao.trim(),
            categoria: d.categoria || 'Geral',
            cor: '#0085db',
            quantidade: 0,
            unidade: it.unidade || 'unid.',
            valorTotal: 0,
          };
          existente.quantidade += Number(it.quantidade) || 0;
          existente.valorTotal += Number(it.subtotal) || 0;
          mapa.set(nomeKey, existente);
        });
      }
    });

    // Se o mapa tiver dados dinâmicos, usamos eles; caso contrário usamos a base rica do design
    if (mapa.size > 0) {
      return Array.from(mapa.values()).map((item, idx) => {
        const cores = ['#0085db', '#ea580c', '#f59e0b', '#06b6d4', '#64748b', '#10b981', '#8763da', '#b45309'];
        return {
          ...item,
          cor: cores[idx % cores.length],
          quantidadeTexto: `${item.quantidade} ${item.unidade}`,
          valorTotalFmt: formatBRL(item.valorTotal),
        };
      });
    }

    // Fallback completo idêntico ao HTML do design Stitch
    return [
      { nome: 'Cimento CP II', cor: '#0085db', quantidadeTexto: '200 sacos', valorTotal: 6800, valorTotalFmt: 'R$ 6.800,00' },
      { nome: 'Tijolo 8 Furos', cor: '#ea580c', quantidadeTexto: '5.000 unid.', valorTotal: 4860, valorTotalFmt: 'R$ 4.860,00' },
      { nome: 'Areia Média Lavada', cor: '#f59e0b', quantidadeTexto: '18 m³', valorTotal: 1980, valorTotalFmt: 'R$ 1.980,00' },
      { nome: 'Ferro CA-50 / CA-60', cor: '#06b6d4', quantidadeTexto: '100 barras', valorTotal: 5320, valorTotalFmt: 'R$ 5.320,00' },
      { nome: 'Brita 1 Graduada', cor: '#64748b', quantidadeTexto: '7 m³', valorTotal: 665.5, valorTotalFmt: 'R$ 665,50' },
      { nome: 'Argamassa AC-II', cor: '#10b981', quantidadeTexto: '66 sacos', valorTotal: 1980, valorTotalFmt: 'R$ 1.980,00' },
      { nome: 'Tubos PVC 25mm', cor: '#8763da', quantidadeTexto: '22 barras', valorTotal: 770, valorTotalFmt: 'R$ 770,00' },
      { nome: 'Tábuas de Pinho 30cm', cor: '#b45309', quantidadeTexto: '4 dúzias', valorTotal: 1290, valorTotalFmt: 'R$ 1.290,00' },
    ];
  }, [despesas, materiais]);

  const totalValorMateriais = useMemo(() => {
    return materiaisComprados.reduce((acc, m) => acc + (m.valorTotal || 0), 0);
  }, [materiaisComprados]);

  // Paginação dos Materiais (4 por página)
  const itensPorPaginaMat = 4;
  const totalPaginasMat = Math.max(1, Math.ceil(materiaisComprados.length / itensPorPaginaMat));
  const materiaisExibidos = materiaisComprados.slice((paginaMateriais - 1) * itensPorPaginaMat, paginaMateriais * itensPorPaginaMat);

  // 3. Categorias de Custo
  const listaCategorias = useMemo(() => {
    const total = totalGeralObra > 0 ? totalGeralObra : 30138;
    const matVal = totaisPorCategoria.materiais > 0 ? totaisPorCategoria.materiais : 19200;
    const moVal = totaisPorCategoria.mao_de_obra > 0 ? totaisPorCategoria.mao_de_obra : 8800;
    const trilhosVal = totaisPorCategoria.trilhos_producao > 0 ? totaisPorCategoria.trilhos_producao : 1676.26;
    const abastVal = totaisPorCategoria.abastecimentos > 0 ? totaisPorCategoria.abastecimentos : 433;
    const outVal = totaisPorCategoria.outros > 0 ? totaisPorCategoria.outros : 240;

    return [
      { nome: 'MATERIAIS DA OBRA', cor: '#0085db', valor: matVal, percentual: ((matVal / total) * 100).toFixed(1).replace('.', ',') + '%' },
      { nome: 'MÃO DE OBRA', cor: '#4bd08b', valor: moVal, percentual: ((moVal / total) * 100).toFixed(1).replace('.', ',') + '%' },
      { nome: 'PRODUÇÃO DE TRILHOS', cor: '#8763da', valor: trilhosVal, percentual: ((trilhosVal / total) * 100).toFixed(1).replace('.', ',') + '%' },
      { nome: 'ABASTECIMENTO', cor: '#46caeb', valor: abastVal, percentual: ((abastVal / total) * 100).toFixed(1).replace('.', ',') + '%' },
      { nome: 'FERRAMENTAS & EQUIPAMENTOS', cor: '#f59e0b', valor: outVal, percentual: ((outVal / total) * 100).toFixed(1).replace('.', ',') + '%' },
      { nome: 'FRETES & LOGÍSTICA', cor: '#ec4899', valor: 150, percentual: '0,5%' },
    ];
  }, [totalGeralObra, totaisPorCategoria]);

  const itensPorPaginaCat = 4;
  const totalPaginasCat = Math.max(1, Math.ceil(listaCategorias.length / itensPorPaginaCat));
  const categoriasExibidas = listaCategorias.slice((paginaCategorias - 1) * itensPorPaginaCat, paginaCategorias * itensPorPaginaCat);

  // 4. Semanas de Gasto
  const listaSemanas = useMemo(() => {
    return [
      { titulo: 'Semana 1 (Início & Sapata)', valor: 'R$ 8.920,00', porcentagem: '82%', cor: '#0085db', descricao: 'Marcação da obra, escavação de sapatas e concretagem inicial.' },
      { titulo: 'Semana 2 (Fundações)', valor: 'R$ 6.450,00', porcentagem: '59%', cor: '#0085db', descricao: 'Vigas baldrame, impermeabilização e alvenaria de embasamento.' },
      { titulo: 'Semana 3 (Pico Alvenaria)', valor: 'R$ 10.840,00', porcentagem: '100%', cor: '#fb977d', descricao: 'Levantamento de paredes, pilares e amarração estrutural.' },
      { titulo: 'Semana 4 (Em andamento)', valor: 'R$ 3.928,00', porcentagem: '36%', cor: '#4bd08b', descricao: 'Montagem de formas, trilhos e concretagem da laje.' },
      { titulo: 'Semana 5 (Instalações Previstas)', valor: 'R$ 4.200,00', porcentagem: '39%', cor: '#8763da', descricao: 'Tubulações de esgoto, água fria e conduítes elétricos.' },
      { titulo: 'Semana 6 (Reboco & Acabamentos)', valor: 'R$ 5.150,00', porcentagem: '48%', cor: '#06b6d4', descricao: 'Chapisco, emboço e contrapiso dos cômodos.' },
    ];
  }, []);

  const itensPorPaginaSem = 4;
  const totalPaginasSem = Math.max(1, Math.ceil(listaSemanas.length / itensPorPaginaSem));
  const semanasExibidas = listaSemanas.slice((paginaSemanas - 1) * itensPorPaginaSem, paginaSemanas * itensPorPaginaSem);

  // 5. Cartões & Dívidas Futuras
  const cartoesExibidos = useMemo(() => {
    if (cartoes && cartoes.length > 0) {
      return cartoes.map(c => ({
        nome: c.nome.toUpperCase(),
        parcelas: `${c.parcelas || 6}x`,
        valorTotal: formatBRL(c.valorFaturaTotal || c.limite || 0),
      }));
    }
    return [
      { nome: 'BB OUROCARD VISA', parcelas: '6x', valorTotal: 'R$ 5.840,00' },
      { nome: 'PORTO SEGURO MASTER', parcelas: '10x', valorTotal: 'R$ 4.250,00' },
      { nome: 'ELO GRAFITE', parcelas: '12x', valorTotal: 'R$ 3.650,00' },
      { nome: 'VISA FINAL 8941', parcelas: '3x', valorTotal: 'R$ 1.680,00' },
    ];
  }, [cartoes]);

  // 6. Fornecedores
  const fornecedoresRank = useMemo(() => {
    const mapa = new Map<string, number>();
    despesas.forEach(d => {
      const forn = (d.fornecedorNome || 'OUTROS FORNECEDORES').trim().toUpperCase();
      mapa.set(forn, (mapa.get(forn) || 0) + (d.valorTotalNota || 0));
    });

    if (mapa.size > 0) {
      const arr = Array.from(mapa.entries()).map(([nome, val]) => ({ nome, val })).sort((a, b) => b.val - a.val);
      const total = arr.reduce((acc, x) => acc + x.val, 0) || 1;
      return arr.slice(0, 4).map(f => ({
        nome: f.nome,
        valorFmt: formatBRL(f.val),
        pct: ((f.val / total) * 100).toFixed(1).replace('.', ',') + '%',
        width: Math.min(100, Math.round((f.val / total) * 100)) + '%',
      }));
    }

    return [
      { nome: 'MARTINS FERRAGENS', valorFmt: 'R$ 8.420,00', pct: '43,8%', width: '43.8%' },
      { nome: '3 IRMÃOS MATERIAIS DE CONSTRUÇÃO', valorFmt: 'R$ 6.150,00', pct: '32,0%', width: '32.0%' },
      { nome: 'DEPÓSITO ALIANÇA HIDRO-ELÉTRICA', valorFmt: 'R$ 2.870,52', pct: '14,9%', width: '14.9%' },
      { nome: 'POSTO PETROBRAS UNIVERSITÁRIO', valorFmt: 'R$ 433,00', pct: '2,3%', width: '2.3%' },
    ];
  }, [despesas]);

  // 7. Etapas Construtivas
  const todasEtapas = useMemo(() => {
    return [
      { numero: 1, nome: '1. ANTES DE INICIAR', status: 'CONCLUÍDA', valor: 'R$ 3.850,00', desc: 'Topografia, terraplanagem, aterro e cercamento', icone: 'check_circle' },
      { numero: 2, nome: '2. SAPATA & FUNDAÇÃO', status: 'CONCLUÍDA', valor: 'R$ 12.440,00', desc: 'Escavação, vigas baldrame, concreto e ferragens', icone: 'check_circle' },
      { numero: 3, nome: '3. ALVENARIA', status: 'EM EXECUÇÃO', valor: 'R$ 13.848,00', desc: 'Paredes, tijolos, vergas e cintas de amarração', icone: 'hourglass_top', extra: '/ R$ 18.000 PREV.' },
      { numero: 4, nome: '4. LAJE & COBERTURA', status: 'PREVISTA', valor: 'R$ 0,00', desc: 'Trilhos, placas, escoramento e telhado termoacústico', icone: 'schedule' },
      { numero: 5, nome: '5. HIDRÁULICA & ESGOTO', status: 'PREVISTA', valor: 'R$ 0,00', desc: 'Tubos, caixas sifonadas e reservatório', icone: 'schedule' },
      { numero: 6, nome: '6. ELÉTRICA & CABEAMENTO', status: 'PREVISTA', valor: 'R$ 0,00', desc: 'Quadros de distribuição e fiações', icone: 'schedule' },
    ];
  }, []);

  const totalPaginasEtapas = Math.ceil(todasEtapas.length / 3);
  const etapasExibidas = todasEtapas.slice((paginaEtapas - 1) * 3, paginaEtapas * 3);

  // 8. Últimas Compras Paginação
  const comprasOrdenadas = useMemo(() => {
    if (despesas.length > 0) {
      return [...despesas].sort((a, b) => b.data.localeCompare(a.data));
    }
    return [
      { id: '1', descricao: 'ARGAMASSAS E TUBULAÇÕES DE ESGOTO INICIAL', fornecedorNome: 'Depósito Aliança', data: '2026-10-15', valorTotalNota: 2870.52, formaPagamento: 'Não informado' },
      { id: '2', descricao: 'MILHEIRO DE TIJOLOS E TÁBUAS PARA CAIXARIA', fornecedorNome: '3 Irmãos Materiais', data: '2026-09-22', valorTotalNota: 6150.00, formaPagamento: 'Pix' },
      { id: '3', descricao: 'PERFIS U, TUBOS GALVANIZADOS E CANTONEIRAS', fornecedorNome: 'Martins Ferragens', data: '2026-09-18', valorTotalNota: 8420.00, formaPagamento: 'Cartão' },
      { id: '4', descricao: 'ABASTECIMENTO FRETE CAÇAMBA DE AREIA', fornecedorNome: 'Posto Petrobras', data: '2026-09-12', valorTotalNota: 433.00, formaPagamento: 'Débito' },
    ];
  }, [despesas]);

  const totalPaginasCompras = Math.max(1, Math.ceil(comprasOrdenadas.length / 4));
  const comprasExibidas = comprasOrdenadas.slice((paginaCompras - 1) * 4, paginaCompras * 4);

  // 9. Diárias Recentes Paginação
  const diariasOrdenadas = useMemo(() => {
    if (diarias.length > 0) {
      return [...diarias].sort((a, b) => b.data.localeCompare(a.data));
    }
    return [
      { id: '1', trabalhadorNome: 'MANOEL DA SILVA', funcao: 'Pedreiro', data: '2026-10-23', fracao: 1, valorTotal: 180, statusPagamento: 'pago' },
      { id: '2', trabalhadorNome: 'CARLOS SILVA', funcao: 'Ajudante', data: '2026-10-24', fracao: 2, valorTotal: 360, statusPagamento: 'pendente' },
      { id: '3', trabalhadorNome: 'ANTONIO FERREIRA', funcao: 'Armador', data: '2026-10-22', fracao: 1, valorTotal: 200, statusPagamento: 'pago' },
      { id: '4', trabalhadorNome: 'JOSÉ MARIANO', funcao: 'Carpinteiro', data: '2026-10-21', fracao: 0.5, valorTotal: 100, statusPagamento: 'pago' },
    ];
  }, [diarias]);

  const totalPaginasDiarias = Math.max(1, Math.ceil(diariasOrdenadas.length / 4));
  const diariasExibidas = diariasOrdenadas.slice((paginaDiarias - 1) * 4, paginaDiarias * 4);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150 font-sans">

      {/* ================= WELCOME HERO BANNER OFICIAL ================= */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider">
              INÍCIO {formatDateBR(activeObra.dataInicio || '2026-09-01')} ·
            </span>
            <span className="text-[#4bd08b] font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#4bd08b]"></span>
              <span>Operante</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111c2d] dark:text-white mt-2">
            PAINEL GERAL DA OBRA
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => navigateToTabWithFilter('despesas', 'nova')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl transition-all shadow-sm shadow-[#0085db]/25 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nova Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => navigateToTabWithFilter('maodeobra', 'nova')}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] border border-[#e6ecf1] dark:border-[#333f55] active:scale-95 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0085db]">group</span>
            <span>Lançar Diária</span>
          </button>
          <button
            type="button"
            onClick={() => navigateToTabWithFilter('recibos')}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#111c2d] dark:text-white bg-[#f6f9fc] dark:bg-[#1a2535] hover:bg-[#e6ecf1] dark:hover:bg-[#202f43] border border-[#e6ecf1] dark:border-[#333f55] active:scale-95 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4bd08b]">assignment_turned_in</span>
            <span>Emitir Recibo</span>
          </button>
        </div>
      </div>

      {/* ================= 4 CORE EXECUTIVES KPIS OFICIAIS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* KPI 1: Custo Total Executado */}
        <div
          onClick={() => navigateToTabWithFilter('despesas')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#0085db] transition-all flex flex-col justify-between h-full cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider truncate">
                TOTAL GASTO NA OBRA
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight">
              {formatBRL(totalGeralObra > 0 ? totalGeralObra : 30138)}
            </div>
            <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wide mt-1.5 truncate">
              ACUMULADO EM NOTAS E INSUMOS
            </p>
          </div>
        </div>

        {/* KPI 2: Mão de Obra Contrato vs Pago */}
        <div
          onClick={() => navigateToTabWithFilter('maodeobra')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#4bd08b] transition-all flex flex-col justify-between h-full cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider truncate">
                MÃO DE OBRA CONTRATADA
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#4bd08b]/15 text-[#4bd08b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">engineering</span>
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight">
              {formatBRL(totalMaoDeObra > 0 ? totalMaoDeObra : 8800)}
            </div>
            <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wide mt-1.5 truncate">
              CONTRATO TOTAL {formatBRL(activeObra.tetoMaoDeObra || 32000)}
            </p>
          </div>
        </div>

        {/* KPI 3: Cartões e Dívida Futura */}
        <div
          onClick={() => navigateToTabWithFilter('cartoes')}
          className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#fb977d] transition-all flex flex-col justify-between h-full cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider truncate">
                CARTÕES &amp; PARCELAS
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#fb977d]/15 text-[#fb977d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#fb977d] tabular-nums tracking-tight">
              {formatBRL(totalAPagar > 0 ? totalAPagar : 15420)}
            </div>
            <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wide mt-1.5 truncate">
              DÍVIDA EM 6X E 12X
            </p>
          </div>
        </div>

        {/* KPI 4: Tempo Atual da Obra */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none hover:border-[#0085db] transition-all flex flex-col justify-between h-full text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-black text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider truncate">
                TEMPO ATUAL DA OBRA
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">timer</span>
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#0085db] tabular-nums tracking-tight text-center">
              {tempoObra.dias} DIAS
            </div>
            <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wide mt-1.5 truncate text-center">
              {tempoObra.sub}
            </p>
          </div>
        </div>

      </div>

      {/* ================= SEÇÃO NOBRE: MATERIAIS COMPRADOS COM PAGINAÇÃO ================= */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6ecf1] dark:border-[#333f55] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#0085db]">inventory_2</span>
              <h2 className="text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                MATERIAIS COMPRADOS
              </h2>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-1">
              Consolidado dos materiais lançados em despesas com quantidade acumulada e valor total.
            </p>
          </div>
          
          {/* Controles de Paginação Direita/Esquerda */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-[#0085db]/10 text-[#0085db] border border-[#0085db]/20 tabular-nums">
              TOTAL: {formatBRL(totalValorMateriais > 0 ? totalValorMateriais : 23645.5)}
            </span>

            <div className="flex items-center gap-1.5 bg-[#f6f9fc] dark:bg-[#1a2535] p-1 rounded-xl border border-[#e6ecf1] dark:border-[#333f55]">
              <span className="text-xs font-bold text-[#707a82] dark:text-[#7c8fac] px-2 tabular-nums">
                {paginaMateriais} de {totalPaginasMat}
              </span>
              <button
                type="button"
                onClick={() => setPaginaMateriais(p => Math.max(1, p - 1))}
                disabled={paginaMateriais <= 1}
                title="Página Anterior"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setPaginaMateriais(p => Math.min(totalPaginasMat, p + 1))}
                disabled={paginaMateriais >= totalPaginasMat}
                title="Próxima Página"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e6ecf1] dark:border-[#333f55] text-[#111c2d] dark:text-white hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grade Dinâmica de Materiais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {materiaisExibidos.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] transition-all flex flex-col justify-between h-full min-h-[175px] shadow-xs"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: item.cor }}></span>
                  <span className="text-xs font-black text-[#111c2d] dark:text-white uppercase tracking-wide truncate max-w-full">
                    {item.nome}
                  </span>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-bold text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider block text-center">
                    QUANTIDADE TOTAL COMPRADA:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#111c2d] dark:text-white tabular-nums tracking-tight mt-1 text-center uppercase">
                    {item.quantidadeTexto}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] text-center">
                <span className="block text-[11px] font-black text-[#707a82] dark:text-[#7c8fac] uppercase tracking-wider mb-1">
                  VALOR TOTAL
                </span>
                <div className="font-black text-[#0085db] tabular-nums text-lg sm:text-xl tracking-tight whitespace-nowrap">
                  {item.valorTotalFmt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LINHA 2: CUSTO TOTAL POR CATEGORIA & GASTO POR SEMANA ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Custo Total e Por Categoria */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  CUSTO TOTAL E POR CATEGORIA
                </h3>
                <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                  Distribuição percentual dos gastos por grupo de despesa da obra.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalCategorias(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 border border-[#0085db]/25 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                  title="Ver todas as categorias no modal"
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0">open_in_new</span>
                  <span className="whitespace-nowrap">Ver mais</span>
                </button>

                <div className="flex items-center flex-nowrap gap-1.5 bg-[#f6f9fc] dark:bg-[#1a2535] px-2 py-1 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] shrink-0 whitespace-nowrap">
                  <span className="text-xs font-bold text-[#707a82] dark:text-[#7c8fac] px-1 tabular-nums whitespace-nowrap shrink-0">
                    {paginaCategorias} de {totalPaginasCat}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPaginaCategorias(p => Math.max(1, p - 1))}
                      disabled={paginaCategorias <= 1}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                      title="Página anterior"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaginaCategorias(p => Math.min(totalPaginasCat, p + 1))}
                      disabled={paginaCategorias >= totalPaginasCat}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                      title="Próximas categorias"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra Multi-Segmento Proporcional */}
            <div className="h-3 w-full bg-[#f6f9fc] dark:bg-[#1a2535] rounded-full overflow-hidden flex gap-0.5 mb-6">
              <div className="bg-[#0085db] h-full transition-all" style={{ width: '63.7%' }} title="Materiais: 63.7%"></div>
              <div className="bg-[#4bd08b] h-full transition-all" style={{ width: '29.2%' }} title="Mão de Obra: 29.2%"></div>
              <div className="bg-[#8763da] h-full transition-all" style={{ width: '5.6%' }} title="Trilhos Próprios: 5.6%"></div>
              <div className="bg-[#46caeb] h-full transition-all" style={{ width: '1.5%' }} title="Abastecimento: 1.5%"></div>
            </div>

            {/* Grade de Categorias Paginadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoriasExibidas.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigateToTabWithFilter('despesas')}
                  className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.cor }}></span>
                      <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-wider">{item.nome}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: item.cor }}>{item.percentual}</span>
                  </div>
                  <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums text-center">
                    {formatBRL(item.valor)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gasto por Semana */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">date_range</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  GASTO POR SEMANA
                </h3>
              </div>
              <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mt-1">
                Evolução dos gastos por semana da obra.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#e6ecf1] dark:border-[#333f55]">
              <button
                type="button"
                onClick={() => setShowModalSemanas(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0085db] bg-[#0085db]/10 hover:bg-[#0085db]/20 border border-[#0085db]/25 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                title="Ver todas as semanas no modal"
              >
                <span className="material-symbols-outlined text-[15px] shrink-0">open_in_new</span>
                <span className="whitespace-nowrap">Ver mais</span>
              </button>

              <div className="flex items-center flex-nowrap gap-1.5 bg-[#f6f9fc] dark:bg-[#1a2535] px-2.5 py-1 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] shrink-0 whitespace-nowrap">
                <span className="text-xs font-bold text-[#707a82] dark:text-[#7c8fac] px-1 tabular-nums whitespace-nowrap shrink-0">
                  {paginaSemanas} de {totalPaginasSem}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPaginaSemanas(p => Math.max(1, p - 1))}
                    disabled={paginaSemanas <= 1}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                    title="Página anterior"
                  >
                    <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaginaSemanas(p => Math.min(totalPaginasSem, p + 1))}
                    disabled={paginaSemanas >= totalPaginasSem}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#0085db] hover:bg-white dark:hover:bg-[#111c2d] disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                    title="Próximas semanas"
                  >
                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {semanasExibidas.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#111c2d] dark:text-white">{item.titulo}</span>
                    <span className="tabular-nums" style={{ color: item.cor }}>{item.valor}</span>
                  </div>
                  <div className="w-full bg-[#f6f9fc] dark:bg-[#1a2535] h-2 rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: item.porcentagem, backgroundColor: item.cor }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================= LINHA 3: PARCELAS & CARTÕES + PRODUÇÃO DE TRILHOS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bloco 1: Parcelas e Cartões */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#fb977d]">credit_card</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  CARTÕES (DÍVIDAS FUTURAS)
                </h3>
              </div>
              <span className="text-xs font-black text-[#fb977d] tabular-nums uppercase">
                TOTAL: {formatBRL(totalAPagar > 0 ? totalAPagar : 15420)}
              </span>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-4">
              Parcelamentos em aberto e compromissos futuros da obra por cartão.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cartoesExibidos.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => navigateToTabWithFilter('cartoes')}
                  className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#111c2d] dark:text-white uppercase tracking-tight truncate mr-2">{card.nome}</span>
                    <span className="text-[#0085db] shrink-0">{card.parcelas}</span>
                  </div>
                  <div className="mt-2 text-lg font-black text-[#111c2d] dark:text-white tabular-nums text-center">
                    {card.valorTotal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 2: Produção Própria de Trilhos & Placas */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#8763da]">construction</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  PRODUÇÃO DE MATERIAIS
                </h3>
              </div>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-4">
              Volume fabricado no canteiro e custo unitário por item produzido.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                onClick={() => navigateToTabWithFilter('producao')}
                className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-center hover:border-[#0085db] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-[#0085db] uppercase tracking-tight text-[11px] font-bold">TRILHOS</span>
                  <span className="text-[#0085db] text-xs font-bold uppercase">{totalTrilhosProduzidos || 132} M</span>
                </div>
                <div className="mt-1 text-lg font-black text-[#111c2d] dark:text-white tabular-nums text-center">
                  {formatBRL(custoIndicativoTrilho > 0 ? custoIndicativoTrilho : 8.73)}
                </div>
                <div className="text-[10px] text-[#707a82] font-semibold mt-0.5 text-center uppercase tracking-wide">
                  POR METRO PRODUZIDO
                </div>
              </div>

              <div
                onClick={() => navigateToTabWithFilter('producao')}
                className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-center hover:border-[#0085db] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-[#0085db] uppercase tracking-tight text-[11px] font-bold">PLACAS DE CIMENTO</span>
                  <span className="text-[#0085db] text-xs font-bold uppercase">{totalPlacasProduzidas || 20} UND</span>
                </div>
                <div className="mt-1 text-lg font-black text-[#111c2d] dark:text-white tabular-nums text-center">
                  R$ 26,19
                </div>
                <div className="text-[10px] text-[#707a82] font-semibold mt-0.5 text-center uppercase tracking-wide">
                  POR UND PRODUZIDA
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                <span className="material-symbols-outlined text-[16px] text-[#0085db]">inventory_2</span>
                TOTAL EM VALOR DA PRODUÇÃO:
              </span>
              <strong className="tabular-nums font-black text-sm text-[#0085db]">
                {formatBRL(totaisPorCategoria.trilhos_producao > 0 ? totaisPorCategoria.trilhos_producao : 1676.26)}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* ================= LINHA 4: GASTO POR FORNECEDOR & CUSTO POR M² ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Fornecedores */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">storefront</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  GASTO POR FORNECEDOR
                </h3>
              </div>
              <span className="text-xs text-[#707a82] font-semibold uppercase tracking-wider">BASE PARA NEGOCIAÇÃO</span>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-4">
              Concentração de compras e volume financeiro por parceiro da obra.
            </p>

            <div className="space-y-2.5">
              {fornecedoresRank.map((forn, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate mb-1.5">{forn.nome}</p>
                    <div className="w-full bg-[#e6ecf1] dark:bg-[#253246] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0085db] h-full rounded-full" style={{ width: forn.width }}></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">{forn.valorFmt}</span>
                    <span className="block text-[10px] text-[#0085db] font-bold">{forn.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custo por Metro Quadrado */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">square_foot</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  CUSTO POR METRO QUADRADO
                </h3>
              </div>
              <span className="text-xs text-[#707a82] font-semibold uppercase tracking-wider">ÁREA TOTAL: 180 M²</span>
            </div>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac] mb-4">
              Evolução do custo acumulado por m² construído em relação ao orçamento planejado.
            </p>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate">CUSTO ATUAL / M²</p>
                    <span className="text-[10px] text-[#0085db] font-bold">24,1% DA META</span>
                  </div>
                  <div className="w-full bg-[#e6ecf1] dark:bg-[#253246] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0085db] h-full rounded-full" style={{ width: '24.1%' }}></div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">R$ 204,50</span>
                  <span className="block text-[10px] text-[#707a82] font-semibold">/ M² EXECUTADO</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate">MATERIAIS / M²</p>
                    <span className="text-[10px] text-[#0085db] font-bold">66,2% DO GASTO</span>
                  </div>
                  <div className="w-full bg-[#e6ecf1] dark:bg-[#253246] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0085db] h-full rounded-full" style={{ width: '66.2%' }}></div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">R$ 135,38</span>
                  <span className="block text-[10px] text-[#707a82] font-semibold">/ M² MATERIAIS</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate">MÃO DE OBRA / M²</p>
                    <span className="text-[10px] text-[#0085db] font-bold">33,8% DO GASTO</span>
                  </div>
                  <div className="w-full bg-[#e6ecf1] dark:bg-[#253246] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0085db] h-full rounded-full" style={{ width: '33.8%' }}></div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#111c2d] dark:text-white tabular-nums">R$ 69,12</span>
                  <span className="block text-[10px] text-[#707a82] font-semibold">/ M² DIÁRIAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex items-center justify-between text-xs">
            <span className="text-[#707a82] font-semibold uppercase tracking-wider text-[11px]">META PREVISTA NO ORÇAMENTO:</span>
            <span className="font-black text-[#0085db] tabular-nums">R$ 850,00 / M²</span>
          </div>
        </div>

      </div>

      {/* ================= LINHA 5: CUSTO POR ETAPA CONSTRUTIVA ================= */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
              CUSTO POR ETAPA DA OBRA
            </h3>
            <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
              Distribuição dos gastos acumulados e previsão orçamentária por fase da construção.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-bold text-[#0085db] uppercase tracking-wider">ETAPA 2 EM EXECUÇÃO</span>
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#e6ecf1] dark:border-[#333f55]">
              <button
                type="button"
                onClick={() => setPaginaEtapas(p => Math.max(1, p - 1))}
                disabled={paginaEtapas <= 1}
                aria-label="Etapa anterior"
                className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums px-1">
                {paginaEtapas} / {totalPaginasEtapas}
              </span>
              <button
                type="button"
                onClick={() => setPaginaEtapas(p => Math.min(totalPaginasEtapas, p + 1))}
                disabled={paginaEtapas >= totalPaginasEtapas}
                aria-label="Próxima etapa"
                className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {etapasExibidas.map(et => (
            <div key={et.numero} className="p-4 rounded-xl bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0085db]">{et.icone}</span>
                    {et.nome}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0085db]/10 text-[#0085db] uppercase">
                    {et.status}
                  </span>
                </div>
                <div className="text-lg font-black text-[#111c2d] dark:text-white tabular-nums my-1">
                  {et.valor} {et.extra && <span className="text-xs font-normal text-[#707a82]">{et.extra}</span>}
                </div>
                <p className="text-[11px] text-[#707a82]">
                  {et.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RECENT ACTIVITY: ÚLTIMAS COMPRAS & DIÁRIAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Últimas Compras */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">receipt_long</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  ÚLTIMAS COMPRAS
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToTabWithFilter('despesas')}
                  className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  VER TODAS ({comprasOrdenadas.length})
                </button>
                <div className="flex items-center gap-1.5 pl-2 border-l border-[#e6ecf1] dark:border-[#333f55]">
                  <button
                    type="button"
                    onClick={() => setPaginaCompras(p => Math.max(1, p - 1))}
                    disabled={paginaCompras <= 1}
                    aria-label="Página anterior de compras"
                    className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums px-1">
                    {paginaCompras} / {totalPaginasCompras}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaginaCompras(p => Math.min(totalPaginasCompras, p + 1))}
                    disabled={paginaCompras >= totalPaginasCompras}
                    aria-label="Próxima página de compras"
                    className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {comprasExibidas.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigateToTabWithFilter('despesas', d.id)}
                  className="p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">receipt</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate">
                        {d.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                        <span className="truncate font-medium">{d.fornecedorNome}</span>
                        <span>·</span>
                        <span>{formatDateBR(d.data)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(d.valorTotalNota)}
                    </span>
                    <span className="block text-[10px] text-[#707a82] font-semibold uppercase">
                      {d.formaPagamento}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diárias Recentes */}
        <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0085db]">group</span>
                <h3 className="text-sm font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                  DIÁRIAS RECENTES
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToTabWithFilter('maodeobra')}
                  className="text-xs font-semibold text-[#0085db] hover:underline cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  VER TODAS ({diariasOrdenadas.length})
                </button>
                <div className="flex items-center gap-1.5 pl-2 border-l border-[#e6ecf1] dark:border-[#333f55]">
                  <button
                    type="button"
                    onClick={() => setPaginaDiarias(p => Math.max(1, p - 1))}
                    disabled={paginaDiarias <= 1}
                    aria-label="Página anterior de diárias"
                    className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="text-xs font-bold text-[#111c2d] dark:text-white tabular-nums px-1">
                    {paginaDiarias} / {totalPaginasDiarias}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaginaDiarias(p => Math.min(totalPaginasDiarias, p + 1))}
                    disabled={paginaDiarias >= totalPaginasDiarias}
                    aria-label="Próxima página de diárias"
                    className="w-7 h-7 rounded-lg bg-[#f6f9fc] dark:bg-[#1a2535] border border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] hover:text-[#0085db] hover:border-[#0085db] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {diariasExibidas.map(dia => (
                <div
                  key={dia.id}
                  onClick={() => navigateToTabWithFilter('maodeobra')}
                  className="p-2.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] hover:border-[#0085db] transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111c2d] dark:text-white uppercase tracking-tight truncate">
                        {dia.trabalhadorNome}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                        <span className="truncate font-medium">{dia.funcao || 'Operador'}</span>
                        <span>·</span>
                        <span>{formatDateBR(dia.data)} · {dia.fracao === 1 ? 'Integral' : `${dia.fracao} Diárias`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(dia.valorTotal)}
                    </span>
                    <span className={`block text-[10px] font-bold uppercase ${dia.statusPagamento === 'pago' ? 'text-[#0085db]' : 'text-[#fb977d]'}`}>
                      {dia.statusPagamento === 'pago' ? 'Pago' : 'A Pagar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL: TODAS AS CATEGORIAS DE CUSTO ================= */}
      {showModalCategorias && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e6ecf1] dark:border-[#333f55] pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                    TODAS AS CATEGORIAS DE CUSTO
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Visão completa de todos os investimentos agrupados por categoria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalCategorias(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 flex-1">
              {listaCategorias.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowModalCategorias(false);
                    navigateToTabWithFilter('despesas');
                  }}
                  className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] flex items-center justify-between gap-4 cursor-pointer hover:border-[#0085db] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs text-white bg-[#0085db]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-[#111c2d] dark:text-white uppercase tracking-wider truncate">
                        {item.nome}
                      </p>
                      <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac] mb-1.5">
                        Participação de <strong className="text-[#0085db]">{item.percentual}</strong> no orçamento realizado
                      </p>
                      <div className="w-full bg-[#e6ecf1] dark:bg-[#253246] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0085db] h-full rounded-full" style={{ width: item.percentual.replace(',', '.') }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(item.valor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e6ecf1] dark:border-[#333f55] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
                Total de categorias ativas: <strong className="text-[#111c2d] dark:text-white">{listaCategorias.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowModalCategorias(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074be] rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TODAS AS SEMANAS DE GASTO ================= */}
      {showModalSemanas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e6ecf1] dark:border-[#333f55] pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">date_range</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111c2d] dark:text-white uppercase tracking-tight">
                    TODAS AS SEMANAS DA OBRA
                  </h3>
                  <p className="text-xs text-[#707a82] dark:text-[#7c8fac]">
                    Histórico completo de gastos e ritmo de desembolso semanal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModalSemanas(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707a82] hover:text-[#111c2d] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-3 flex-1">
              {listaSemanas.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowModalSemanas(false);
                    navigateToTabWithFilter('maodeobra');
                  }}
                  className="p-3.5 rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] flex items-center justify-between gap-4 cursor-pointer hover:border-[#0085db] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs text-white bg-[#0085db]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#111c2d] dark:text-white uppercase tracking-wider truncate">
                        {item.titulo}
                      </p>
                      <p className="text-[11px] font-semibold text-[#707a82] dark:text-[#7c8fac]">
                        {item.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#0085db] tabular-nums">
                      {item.valor}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e6ecf1] dark:border-[#333f55] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-4 text-xs font-semibold text-[#707a82] dark:text-[#7c8fac]">
                <span>Total de semanas: <strong className="text-[#111c2d] dark:text-white">{listaSemanas.length}</strong></span>
                <span className="text-[#e6ecf1] dark:text-[#333f55]">|</span>
                <span className="uppercase tracking-wider">Média Semanal: <strong className="text-[#0085db]">R$ 7.534,50</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowModalSemanas(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0074be] rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
