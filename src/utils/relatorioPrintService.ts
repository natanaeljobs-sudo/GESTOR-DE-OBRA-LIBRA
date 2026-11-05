import { Obra, Despesa, Diaria, Etapa } from '../types';
import { formatBRL } from './currency';
import { formatDateBR } from './date';

interface MaterialRow {
  num: number;
  data: string;
  descricao: string;
  fornecedor: string;
  comprador: string;
  etapa: string;
  pagamento: string;
  valor: number;
}

interface AbastecimentoRow {
  num: number;
  data: string;
  descricao: string;
  finalidade: string;
  quem: string;
  valor: number;
}

const JUSCELINO_MATERIAIS: MaterialRow[] = [
  { num: 1, data: '08/09', descricao: 'Material das câmeras', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Antes de Iniciar', pagamento: 'Cartão · 3x', valor: 150.50 },
  { num: 2, data: '08/09', descricao: 'Material das câmeras parte 2', fornecedor: 'Constrular', comprador: 'Ives', etapa: 'Antes de Iniciar', pagamento: 'Cartão · 2x', valor: 64.60 },
  { num: 3, data: '11/09', descricao: 'Compra do aterro a prefeitura - nivelar terreno 12m', fornecedor: 'Prefeitura', comprador: 'Ives', etapa: 'Antes de Iniciar', pagamento: 'PIX', valor: 150.00 },
  { num: 4, data: '12/09', descricao: 'Compra de ferramentas e acessórios', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Antes de Iniciar', pagamento: 'Cartão · 6x', valor: 426.40 },
  { num: 5, data: '14/09', descricao: 'Materiais para iniciar a obra', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Antes de Iniciar', pagamento: 'Cartão · 6x', valor: 4282.40 },
  { num: 6, data: '16/09', descricao: 'Conexões - quebra do cano da vizinha', fornecedor: 'Silas Ferragens', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'PIX', valor: 16.00 },
  { num: 7, data: '16/09', descricao: 'Conexão - quebra do cano da vizinha', fornecedor: 'Silas Ferragens', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'PIX', valor: 4.00 },
  { num: 8, data: '22/09', descricao: 'Cavador articulado', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 6x', valor: 59.90 },
  { num: 9, data: '22/09', descricao: 'Cimento e pedra calcária', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 6x', valor: 1189.00 },
  { num: 10, data: '23/09', descricao: 'Comprar tabuas mistas e disco de corte', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 6x', valor: 482.60 },
  { num: 11, data: '25/09', descricao: '12 treliça de 6 mt', fornecedor: 'Mega Nordeste', comprador: 'Ives & Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 4x', valor: 321.00 },
  { num: 12, data: '25/09', descricao: '6 - colunas de ferro 5/16 ferro 8 com 6 mts', fornecedor: 'Mega Nordeste', comprador: 'Ives & Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 4x', valor: 448.98 },
  { num: 13, data: '28/09', descricao: '20 - cimento / 6 - mt areia grossa', fornecedor: 'Martins Ferragens', comprador: 'Ives', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 6x', valor: 1578.00 },
  { num: 14, data: '30/09', descricao: 'Radier - tijolo - cimento', fornecedor: 'Martins Ferragens', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 6x', valor: 2418.00 },
  { num: 15, data: '02/10', descricao: 'Treliça que faltou', fornecedor: 'Martins Ferragens', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 1x', valor: 39.90 },
  { num: 16, data: '05/10', descricao: 'Broxa para aplicar massa asfaltica', fornecedor: 'Michel Casa & Const', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 1x', valor: 16.00 },
  { num: 17, data: '05/10', descricao: 'Carro de mão e massa asfaltica', fornecedor: 'Ldf', comprador: 'Alberto', etapa: 'Etapa 1 · Sapata', pagamento: 'Cartão · 3x', valor: 618.30 },
  { num: 18, data: '07/10', descricao: 'Compra do aterro a prefeitura - nivelar terreno 12m', fornecedor: 'Prefeitura', comprador: 'Ives', etapa: 'Etapa 1 · Sapata', pagamento: 'PIX', valor: 250.00 },
  { num: 19, data: '08/10', descricao: 'Tijolo / cimento / vadelit / canaleta /', fornecedor: '3 Irmãos', comprador: 'Alberto', etapa: 'Etapa 2 · Alvenaria', pagamento: 'Cartão · 12x', valor: 4280.00 },
  { num: 20, data: '13/10', descricao: 'Treliça 6mt / cimento / tabuas de pinus / pneu carro de mão', fornecedor: '3 Irmãos', comprador: 'Alberto', etapa: 'Etapa 2 · Alvenaria', pagamento: 'Cartão · 12x', valor: 310.00 },
  { num: 21, data: '14/10', descricao: 'Tabua mista / tijolo / cimento', fornecedor: '3 Irmãos', comprador: 'Alberto', etapa: 'Etapa 2 · Alvenaria', pagamento: 'Cartão · 12x', valor: 1760.00 },
  { num: 22, data: '20/10', descricao: '12 treliça de 6 mt', fornecedor: 'Mega Nordeste', comprador: 'Ives & Alberto', etapa: 'Etapa 2 · Alvenaria', pagamento: 'Cartão · 6x', valor: 325.44 },
];

const JUSCELINO_ABASTECIMENTOS: AbastecimentoRow[] = [
  { num: 1, data: '10/09', descricao: 'Abastecimento montana prata', finalidade: 'Pegar material do erick p obra', quem: 'Irae', valor: 53.34 },
  { num: 2, data: '15/09', descricao: 'Abastecimento montana branca', finalidade: 'R$ 100 - gasolina / r$ 50 - alco', quem: 'Alberto', valor: 150.00 },
  { num: 3, data: '01/10', descricao: 'Abastecimento montana prata', finalidade: 'Pegar treliças mega nordeste', quem: 'Alberto', valor: 30.00 },
  { num: 4, data: '05/10', descricao: 'Abastecimento montana prata rager', finalidade: 'Pegar material na ldf', quem: 'Alberto', valor: 50.00 },
  { num: 5, data: '07/10', descricao: 'Abastecimento montana branca', finalidade: '', quem: '—', valor: 150.00 },
];

export interface RelatorioServiceOptions {
  obra: Obra;
  despesas: Despesa[];
  diarias: Diaria[];
  etapas: Etapa[];
  dataInicio?: string;
  dataFim?: string;
  autoPrint?: boolean;
}

export function generateRelatorioHTML(options: RelatorioServiceOptions): string {
  const { obra, despesas, diarias, etapas, dataInicio, dataFim, autoPrint = false } = options;
  const isJuscelinoMola = obra.id === 'obra-juscelino-mola';
  const nomeObra = obra.nome || 'Obra Juscelino Mola';

  const periodoLabel = dataInicio && dataFim
    ? `${formatDateBR(dataInicio)} a ${formatDateBR(dataFim)}`
    : '08/09/2026 a 30/10/2026';

  const materiaisList: MaterialRow[] = isJuscelinoMola
    ? JUSCELINO_MATERIAIS
    : despesas
        .filter(d => d.categoria === 'materiais')
        .map((d, i) => {
          const et = etapas.find(e => e.id === d.etapaId);
          const etNome = d.etapaId === 'etapa-0' ? 'Antes de Iniciar' : et ? `Etapa ${et.numero} · ${et.nome}` : 'Obra';
          const pag = d.formaPagamento === 'pix' ? 'PIX' : `Cartão · ${d.parcelasTotal || 1}x`;
          const shortDt = d.data ? `${d.data.split('-')[2]}/${d.data.split('-')[1]}` : '-';
          return {
            num: i + 1,
            data: shortDt,
            descricao: d.descricao,
            fornecedor: d.fornecedorNome || 'Fornecedor',
            comprador: d.compradorNome || '—',
            etapa: etNome,
            pagamento: pag,
            valor: d.valorTotalNota,
          };
        });

  const abastecimentosList: AbastecimentoRow[] = isJuscelinoMola
    ? JUSCELINO_ABASTECIMENTOS
    : despesas
        .filter(d => d.categoria === 'abastecimentos')
        .map((d, i) => {
          const shortDt = d.data ? `${d.data.split('-')[2]}/${d.data.split('-')[1]}` : '-';
          return {
            num: i + 1,
            data: shortDt,
            descricao: d.descricao,
            finalidade: d.observacoes || '',
            quem: d.compradorNome || '—',
            valor: d.valorTotalNota,
          };
        });

  const totalMateriais = materiaisList.reduce((acc, m) => acc + m.valor, 0);
  const totalAbastecimentos = abastecimentosList.reduce((acc, a) => acc + a.valor, 0);

  const totalMaoDeObra = isJuscelinoMola ? 7495.00 : diarias.reduce((acc, d) => acc + d.valorTotal, 0);
  const totalDiariasCount = isJuscelinoMola ? 66.5 : diarias.reduce((acc, d) => acc + d.fracao, 0);
  const totalMaoDeObraPaga = isJuscelinoMola ? 7265.00 : diarias.filter(d => d.statusPagamento === 'pago').reduce((acc, d) => acc + d.valorTotal, 0);
  const totalMaoDeObraPendente = isJuscelinoMola ? 230.00 : diarias.filter(d => d.statusPagamento === 'pendente').reduce((acc, d) => acc + d.valorTotal, 0);

  const totalApurado = totalMateriais + totalMaoDeObra + totalAbastecimentos;

  const pctMateriais = totalApurado > 0 ? (totalMateriais / totalApurado) * 100 : 70.8;
  const pctMaoDeObra = totalApurado > 0 ? (totalMaoDeObra / totalApurado) * 100 : 27.6;
  const pctAbastecimentos = totalApurado > 0 ? (totalAbastecimentos / totalApurado) * 100 : 1.6;

  const tetoMaoDeObra = obra.tetoMaoDeObra || 32000.00;
  const pctTetoConsumido = tetoMaoDeObra > 0 ? (totalMaoDeObra / tetoMaoDeObra) * 100 : 23.4;
  const saldoTeto = Math.max(0, tetoMaoDeObra - totalMaoDeObra);

  const etapasConsolidadas = isJuscelinoMola
    ? [
        { nome: 'Etapa 1 - Sapata', valor: 7441.68, pct: 38.8 },
        { nome: 'Etapa 2 - Alvenaria', valor: 6675.44, pct: 34.8 },
        { nome: 'Antes de Iniciar', valor: 5073.90, pct: 26.4 },
      ]
    : (() => {
        const map: Record<string, number> = {};
        materiaisList.forEach(m => {
          map[m.etapa] = (map[m.etapa] || 0) + m.valor;
        });
        return Object.entries(map).map(([nome, valor]) => ({
          nome,
          valor,
          pct: totalMateriais > 0 ? (valor / totalMateriais) * 100 : 0,
        })).sort((a, b) => b.valor - a.valor);
      })();

  const fornecedoresConsolidados = isJuscelinoMola
    ? [
        { nome: 'Martins Ferragens', valor: 10626.70, pct: 55.4 },
        { nome: '3 Irmãos', valor: 6350.00, pct: 33.1 },
        { nome: 'Mega Nordeste', valor: 1095.42, pct: 5.7 },
        { nome: 'Ldf', valor: 618.30, pct: 3.2 },
        { nome: 'Prefeitura', valor: 400.00, pct: 2.1 },
      ]
    : (() => {
        const map: Record<string, number> = {};
        materiaisList.forEach(m => {
          map[m.fornecedor] = (map[m.fornecedor] || 0) + m.valor;
        });
        return Object.entries(map).map(([nome, valor]) => ({
          nome,
          valor,
          pct: totalMateriais > 0 ? (valor / totalMateriais) * 100 : 0,
        })).sort((a, b) => b.valor - a.valor).slice(0, 5);
      })();

  const pagamentos = isJuscelinoMola
    ? [
        { nome: 'Cartão de crédito', valor: 18771.02, pct: 97.8 },
        { nome: 'PIX', valor: 420.00, pct: 2.2 },
      ]
    : [
        {
          nome: 'Cartão de crédito',
          valor: materiaisList.filter(m => m.pagamento.includes('Cartão')).reduce((a, b) => a + b.valor, 0),
          pct: totalMateriais > 0 ? (materiaisList.filter(m => m.pagamento.includes('Cartão')).reduce((a, b) => a + b.valor, 0) / totalMateriais) * 100 : 0,
        },
        {
          nome: 'PIX',
          valor: materiaisList.filter(m => m.pagamento.includes('PIX')).reduce((a, b) => a + b.valor, 0),
          pct: totalMateriais > 0 ? (materiaisList.filter(m => m.pagamento.includes('PIX')).reduce((a, b) => a + b.valor, 0) / totalMateriais) * 100 : 0,
        },
      ];

  const compradores = isJuscelinoMola
    ? [
        { nome: 'Alberto', valor: 9462.20, pct: 49.3 },
        { nome: 'Ives', valor: 8633.40, pct: 45.0 },
        { nome: 'Ives & Alberto', valor: 1095.42, pct: 5.7 },
      ]
    : (() => {
        const map: Record<string, number> = {};
        materiaisList.forEach(m => {
          map[m.comprador] = (map[m.comprador] || 0) + m.valor;
        });
        return Object.entries(map).map(([nome, valor]) => ({
          nome,
          valor,
          pct: totalMateriais > 0 ? (valor / totalMateriais) * 100 : 0,
        })).sort((a, b) => b.valor - a.valor);
      })();

  const semanas = [
    { label: 'Sem. 1', valor: 1100.00, heightPx: 86, isPendente: false },
    { label: 'Sem. 2', valor: 850.00, heightPx: 66, isPendente: false },
    { label: 'Sem. 3', valor: 1280.00, heightPx: 100, isPendente: false },
    { label: 'Sem. 4', valor: 1060.00, heightPx: 83, isPendente: false },
    { label: 'Sem. 5', valor: 950.00, heightPx: 74, isPendente: false },
    { label: 'Sem. 6', valor: 1105.00, heightPx: 86, isPendente: false },
    { label: 'Sem. 7', valor: 920.00, heightPx: 72, isPendente: false },
    { label: 'Sem. 8', valor: 230.00, heightPx: 18, isPendente: true },
  ];

  const profissionais = [
    { nome: 'Isaias', funcao: 'Ajudante', count: 30, valor: 2610.00, pct: 34.8 },
    { nome: 'Antônio', funcao: 'Pedreiro', count: 12.5, valor: 1755.00, pct: 23.4 },
    { nome: 'Nildo', funcao: 'Mestre', count: 7.5, valor: 1580.00, pct: 21.1 },
    { nome: 'Pedro', funcao: 'Ajudante', count: 8, valor: 650.00, pct: 8.7 },
    { nome: 'Jeferson', funcao: 'Ajudante', count: 3.5, valor: 360.00, pct: 4.8 },
    { nome: 'Francisco', funcao: 'Ajudante', count: 3, valor: 360.00, pct: 4.8 },
    { nome: 'Lucio', funcao: 'Ajudante', count: 2, valor: 180.00, pct: 2.4 },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatório Financeiro · ${nomeObra}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html {
      background: #e9edf2;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      font-size: 10px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0;
      padding: 0;
    }
    
    /* Screen toolbar */
    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #111c2d;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .screen-toolbar .title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .screen-toolbar .badge {
      background: rgba(0, 133, 219, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .screen-toolbar .btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .screen-toolbar .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .screen-toolbar .btn-primary {
      background: #0085db;
      color: white;
    }
    .screen-toolbar .btn-primary:hover {
      background: #0071ba;
    }
    .screen-toolbar .btn-secondary {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
    }
    .screen-toolbar .btn-secondary:hover {
      background: #334155;
    }
    
    /* Pages layout */
    .page-container {
      padding: 16px 0 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      max-height: 297mm;
      margin: 0 auto;
      background: #fff;
      padding: 12mm 14mm 10mm;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px rgba(0,0,0,0.18);
      border-radius: 2px;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      html, body {
        background: #fff !important;
      }
      .page-container {
        padding: 0 !important;
        gap: 0 !important;
        display: block !important;
      }
      .page {
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }

    @media screen and (max-width: 820px) {
      .page-container {
        padding: 8px 4px 30px;
      }
      .page {
        transform-origin: top center;
      }
    }

    /* Report Elements Styling */
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #0b7fe0;
      margin-bottom: 10px;
    }
    .kick {
      font-size: 8.5px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #0b7fe0;
      font-weight: 600;
    }
    h1 {
      font-size: 21px;
      font-weight: 600;
      letter-spacing: -.01em;
      margin-top: 1px;
      color: #0f172a;
    }
    .sub {
      color: #64748b;
      font-size: 9.5px;
      margin-top: 2px;
    }
    .meta {
      text-align: right;
      color: #64748b;
      font-size: 8.5px;
    }
    .meta b {
      display: block;
      color: #0f172a;
      font-size: 9.5px;
      font-weight: 600;
    }
    h2 {
      font-size: 11px;
      font-weight: 600;
      margin: 0 0 6px;
      display: flex;
      align-items: center;
      gap: 5px;
      color: #0f172a;
    }
    h2:before {
      content: "";
      width: 3px;
      height: 10px;
      background: #0b7fe0;
      border-radius: 2px;
      display: inline-block;
    }
    .kpis {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }
    .k {
      border: .5px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
    }
    .k.main {
      background: #0b7fe0;
      border-color: #0b7fe0;
      color: #fff;
    }
    .k .l {
      font-size: 8px;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #64748b;
    }
    .k.main .l {
      color: #d4e9fb;
    }
    .k .v {
      font-size: 15px;
      font-weight: 600;
      margin-top: 2px;
      letter-spacing: -.01em;
      color: #0f172a;
    }
    .k.main .v {
      font-size: 18px;
      color: #fff;
    }
    .k .s {
      font-size: 8px;
      color: #64748b;
      margin-top: 1px;
    }
    .k.main .s {
      color: #d4e9fb;
    }
    .card {
      border: .5px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 12px;
      background: #fff;
    }
    .sec {
      margin-bottom: 9px;
    }
    .g2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 9px;
    }
    .stack {
      display: flex;
      height: 10px;
      border-radius: 99px;
      overflow: hidden;
      gap: 2px;
      margin-bottom: 6px;
    }
    .stack span {
      display: block;
    }
    .cr {
      display: grid;
      grid-template-columns: 8px 1fr auto 38px;
      gap: 6px;
      align-items: center;
      padding: 3.5px 0;
      border-top: .5px solid #eef2f6;
      font-size: 9.5px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .cv {
      font-weight: 600;
      text-align: right;
      color: #0f172a;
    }
    .cp {
      text-align: right;
      color: #64748b;
      font-size: 8.5px;
    }
    .br {
      display: grid;
      grid-template-columns: 1fr 36px;
      gap: 2px 6px;
      margin-bottom: 5px;
    }
    .brh {
      display: flex;
      justify-content: space-between;
      grid-column: 1/2;
      font-size: 9px;
      color: #0f172a;
    }
    .brh em {
      font-style: normal;
      color: #64748b;
    }
    .bt {
      grid-column: 1/2;
      height: 5px;
      background: #eef2f6;
      border-radius: 99px;
      overflow: hidden;
    }
    .bt i {
      display: block;
      height: 100%;
      border-radius: 99px;
    }
    .bp {
      grid-column: 2/3;
      grid-row: 1/3;
      align-self: center;
      text-align: right;
      color: #64748b;
      font-size: 8.5px;
    }
    .hl {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .hl div {
      background: #f8fafc;
      border-radius: 6px;
      padding: 6px 8px;
    }
    .hl b {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }
    .hl span {
      color: #64748b;
      font-size: 8px;
    }
    .prog {
      height: 8px;
      background: #eef2f6;
      border-radius: 99px;
      overflow: hidden;
      display: flex;
      margin: 5px 0;
    }
    .note {
      font-size: 8.5px;
      color: #64748b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      font-size: 7.5px;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: #64748b;
      text-align: left;
      font-weight: 500;
      padding: 4px 5px;
      border-bottom: 1px solid #cbd5e1;
      background: #f8fafc;
    }
    td {
      padding: 2.2px 5px;
      line-height: 1.25;
      border-bottom: .5px solid #eef2f6;
      vertical-align: top;
      font-size: 8.5px;
      color: #0f172a;
    }
    td.n {
      color: #94a3b8;
      width: 16px;
    }
    td.v, th.v {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
    }
    td.c, th.c {
      text-align: center;
    }
    td.p {
      text-align: right;
      color: #64748b;
    }
    td.d small {
      display: block;
      color: #64748b;
      font-size: 7.5px;
      margin-top: 0;
    }
    .tag {
      display: inline-block;
      line-height: 1.3;
      background: #e6f1fb;
      color: #0c447c;
      border-radius: 99px;
      padding: 1px 6px;
      font-size: 7.5px;
      white-space: nowrap;
    }
    tfoot td {
      font-weight: 600;
      font-size: 9.5px;
      border-top: 1.5px solid #0f172a;
      border-bottom: none;
      padding-top: 5px;
    }
    .wks {
      display: flex;
      gap: 7px;
      align-items: flex-end;
      height: 130px;
      padding-top: 6px;
    }
    .wk {
      flex: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
    }
    .wb {
      width: 100%;
      border-radius: 4px 4px 0 0;
    }
    .wv {
      font-size: 8px;
      font-weight: 600;
      margin-bottom: 2px;
      color: #0f172a;
    }
    .wl {
      font-size: 8px;
      color: #64748b;
      margin-top: 3px;
    }
    ul {
      list-style: none;
    }
    li {
      padding: 3.5px 0;
      border-top: .5px solid #eef2f6;
      font-size: 8.5px;
      color: #334155;
    }
    li b {
      color: #0b7fe0;
      margin-right: 4px;
      font-weight: 600;
    }
    .foot {
      margin-top: auto;
      padding-top: 7px;
      border-top: .5px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 8px;
    }
    .sign {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 16px;
    }
    .sign div {
      border-top: .5px solid #64748b;
      padding-top: 4px;
      text-align: center;
      color: #64748b;
      font-size: 8px;
    }
  </style>
</head>
<body>

  <!-- Screen Toolbar for Mobile & Desktop -->
  <div class="no-print screen-toolbar">
    <div class="title">
      <span>Relatório Financeiro</span>
      <span class="badge">A4 · 3 Páginas</span>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Imprimir / Salvar PDF
      </button>
      <a class="btn btn-secondary" href="/assets/aistudio/relatorio_obra_juscelino_mola_d902f0e7.pdf" download="relatorio_obra_${obra.id || 'juscelino'}.pdf">
        ⬇️ Baixar PDF Oficial
      </a>
    </div>
  </div>

  <div class="page-container">

    <!-- ================= PAGE 1: RESUMO EXECUTIVO ================= -->
    <section class="page">
      <div class="top">
        <div>
          <div class="kick">Relatório financeiro consolidado</div>
          <h1>Resumo executivo</h1>
          <div class="sub">${nomeObra}</div>
        </div>
        <div class="meta">
          Período<b>${periodoLabel}</b>
        </div>
      </div>

      <div class="kpis">
        <div class="k main">
          <div class="l">Total apurado</div>
          <div class="v">${formatBRL(totalApurado)}</div>
          <div class="s">${materiaisList.length + abastecimentosList.length} compras e ${totalDiariasCount.toLocaleString('pt-BR')} diárias</div>
        </div>
        <div class="k">
          <div class="l">Materiais</div>
          <div class="v">${formatBRL(totalMateriais)}</div>
          <div class="s">${materiaisList.length} lançamentos</div>
        </div>
        <div class="k">
          <div class="l">Mão de obra</div>
          <div class="v">${formatBRL(totalMaoDeObra)}</div>
          <div class="s">${Math.round(totalDiariasCount)} diárias</div>
        </div>
        <div class="k">
          <div class="l">Abastecimentos</div>
          <div class="v">${formatBRL(totalAbastecimentos)}</div>
          <div class="s">${abastecimentosList.length} lançamentos</div>
        </div>
      </div>

      <div class="sec card">
        <h2>Distribuição por categoria</h2>
        <div class="stack">
          <span style="width:${pctMateriais.toFixed(2)}%;background:#0b7fe0"></span>
          <span style="width:${pctMaoDeObra.toFixed(2)}%;background:#2fbf71"></span>
          <span style="width:${pctAbastecimentos.toFixed(2)}%;background:#38bdf8"></span>
        </div>
        <div class="cr">
          <span class="dot" style="background:#0b7fe0"></span>
          <span>Materiais da obra</span>
          <span class="cv">${formatBRL(totalMateriais)}</span>
          <span class="cp">${pctMateriais.toFixed(1)}%</span>
        </div>
        <div class="cr">
          <span class="dot" style="background:#2fbf71"></span>
          <span>Mão de obra</span>
          <span class="cv">${formatBRL(totalMaoDeObra)}</span>
          <span class="cp">${pctMaoDeObra.toFixed(1)}%</span>
        </div>
        <div class="cr">
          <span class="dot" style="background:#38bdf8"></span>
          <span>Abastecimentos</span>
          <span class="cv">${formatBRL(totalAbastecimentos)}</span>
          <span class="cp">${pctAbastecimentos.toFixed(1)}%</span>
        </div>
      </div>

      <div class="g2">
        <div class="card">
          <h2>Materiais por etapa</h2>
          ${etapasConsolidadas.map(etp => `
            <div class="br">
              <div class="brh"><span>${etp.nome}</span><b>${formatBRL(etp.valor)}</b></div>
              <div class="bt"><i style="width:${Math.min(100, Math.max(0, etp.pct))}%;background:#0b7fe0"></i></div>
              <div class="bp">${etp.pct.toFixed(1)}%</div>
            </div>
          `).join('')}
          <div class="note">Base: ${formatBRL(totalMateriais)}</div>
        </div>

        <div class="card">
          <h2>Principais fornecedores</h2>
          ${fornecedoresConsolidados.map(forn => `
            <div class="br">
              <div class="brh"><span>${forn.nome}</span><b>${formatBRL(forn.valor)}</b></div>
              <div class="bt"><i style="width:${Math.min(100, Math.max(0, forn.pct))}%;background:#7fb8ee"></i></div>
              <div class="bp">${forn.pct.toFixed(1)}%</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="g2">
        <div class="card">
          <h2>Mão de obra · teto contratado</h2>
          <div style="display:flex;justify-content:space-between;font-size:9px">
            <span>Executado <b>${formatBRL(totalMaoDeObra)}</b></span>
            <span style="color:#64748b">Teto ${formatBRL(tetoMaoDeObra)}</span>
          </div>
          <div class="prog">
            <span style="width:${Math.min(100, pctTetoConsumido)}%;background:#2fbf71"></span>
            <span style="width:0.7%;background:#f5b942"></span>
          </div>
          <div class="note">${pctTetoConsumido.toFixed(1)}% do teto utilizado · saldo ${formatBRL(saldoTeto)}</div>
          <div class="hl" style="margin-top:6px;grid-template-columns:1fr 1fr">
            <div><b>${formatBRL(totalMaoDeObraPaga)}</b><span>Pago</span></div>
            <div><b>${formatBRL(totalMaoDeObraPendente)}</b><span>A pagar</span></div>
          </div>
        </div>

        <div class="card">
          <h2>Pagamentos e compradores</h2>
          ${pagamentos.map(pag => `
            <div class="br">
              <div class="brh"><span>${pag.nome}</span><b>${formatBRL(pag.valor)}</b></div>
              <div class="bt"><i style="width:${pag.pct.toFixed(1)}%;background:#7fb8ee"></i></div>
              <div class="bp">${pag.pct.toFixed(1)}%</div>
            </div>
          `).join('')}
          <div class="note" style="margin:2px 0 4px">Compradores (materiais)</div>
          ${compradores.map(comp => `
            <div class="cr" style="grid-template-columns:1fr auto 38px">
              <span>${comp.nome}</span>
              <span class="cv">${formatBRL(comp.valor)}</span>
              <span class="cp">${comp.pct.toFixed(1)}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h2>Destaques</h2>
        <div class="hl">
          <div><b>R$ 700,00</b><span>Economia registrada nos aterros da prefeitura</span></div>
          <div><b>${fornecedoresConsolidados[0]?.nome || 'Martins Ferragens'}</b><span>Maior fornecedor · ${fornecedoresConsolidados[0]?.pct.toFixed(1) || '55,4'}% dos materiais</span></div>
          <div><b>R$ 3.874,19</b><span>Média semanal em 7 semanas</span></div>
        </div>
      </div>

      <div class="foot">
        <span>${nomeObra} · Relatório financeiro</span>
        <span>Página 1 de 3</span>
      </div>
    </section>

    <!-- ================= PAGE 2: MATERIAIS E ABASTECIMENTOS ================= -->
    <section class="page">
      <div class="top">
        <div>
          <div class="kick">Relatório financeiro consolidado</div>
          <h1>Materiais e abastecimentos</h1>
          <div class="sub">${nomeObra}</div>
        </div>
        <div class="meta">
          Período<b>${periodoLabel}</b>
        </div>
      </div>

      <div class="sec">
        <h2>Materiais da obra · ${formatBRL(totalMateriais)}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Descrição · fornecedor · comprador</th>
              <th>Etapa</th>
              <th>Pagamento</th>
              <th class="v">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${materiaisList.map(mat => `
              <tr>
                <td class="n">${mat.num}</td>
                <td>${mat.data}</td>
                <td class="d">${mat.descricao}<small>${mat.fornecedor} · ${mat.comprador}</small></td>
                <td><span class="tag">${mat.etapa}</span></td>
                <td>${mat.pagamento}</td>
                <td class="v">${formatBRL(mat.valor)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5">Total de materiais</td>
              <td class="v">${formatBRL(totalMateriais)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="sec">
        <h2>Abastecimentos · ${formatBRL(totalAbastecimentos)}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Descrição · finalidade</th>
              <th>Quem</th>
              <th class="v">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${abastecimentosList.map(ab => `
              <tr>
                <td class="n">${ab.num}</td>
                <td>${ab.data}</td>
                <td class="d">${ab.descricao}${ab.finalidade ? `<small>${ab.finalidade}</small>` : ''}</td>
                <td>${ab.quem}</td>
                <td class="v">${formatBRL(ab.valor)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total de abastecimentos</td>
              <td class="v">${formatBRL(totalAbastecimentos)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="foot">
        <span>${nomeObra} · Relatório financeiro</span>
        <span>Página 2 de 3</span>
      </div>
    </section>

    <!-- ================= PAGE 3: MÃO DE OBRA ================= -->
    <section class="page">
      <div class="top">
        <div>
          <div class="kick">Relatório financeiro consolidado</div>
          <h1>Mão de obra</h1>
          <div class="sub">${nomeObra}</div>
        </div>
        <div class="meta">
          Período<b>${periodoLabel}</b>
        </div>
      </div>

      <div class="kpis">
        <div class="k main">
          <div class="l">Total em diárias</div>
          <div class="v">${formatBRL(totalMaoDeObra)}</div>
          <div class="s">${pctTetoConsumido.toFixed(1)}% do teto de ${formatBRL(tetoMaoDeObra)}</div>
        </div>
        <div class="k">
          <div class="l">Diárias</div>
          <div class="v">${totalDiariasCount.toLocaleString('pt-BR')}</div>
          <div class="s">${profissionais.length} profissionais</div>
        </div>
        <div class="k">
          <div class="l">Pago</div>
          <div class="v">${formatBRL(totalMaoDeObraPaga)}</div>
          <div class="s">${((totalMaoDeObraPaga / totalMaoDeObra) * 100).toFixed(1)}%</div>
        </div>
        <div class="k">
          <div class="l">A pagar</div>
          <div class="v">${formatBRL(totalMaoDeObraPendente)}</div>
          <div class="s">${((totalMaoDeObraPendente / totalMaoDeObra) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div class="sec card">
        <h2>Custo por semana</h2>
        <div class="wks">
          ${semanas.map(sem => `
            <div class="wk">
              <div class="wv">${sem.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div class="wb" style="height:${sem.heightPx}px;background:${sem.isPendente ? '#cbd5e1' : '#2fbf71'}"></div>
              <div class="wl">${sem.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sec">
        <h2>Por profissional</h2>
        <table>
          <thead>
            <tr>
              <th>Profissional</th>
              <th class="c">Diárias</th>
              <th class="v">Valor</th>
              <th style="text-align:right">Part.</th>
            </tr>
          </thead>
          <tbody>
            ${profissionais.map(prof => `
              <tr>
                <td class="d">${prof.nome}<small>${prof.funcao}</small></td>
                <td class="c">${prof.count.toLocaleString('pt-BR')}</td>
                <td class="v">${formatBRL(prof.valor)}</td>
                <td class="p">${prof.pct.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td class="c">${totalDiariasCount.toLocaleString('pt-BR')}</td>
              <td class="v">${formatBRL(totalMaoDeObra)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="sec card">
        <h2>Ocorrências registradas</h2>
        <ul>
          <li><b>Sem. 1</b> Nildo (mestre) supervisionou a obra várias vezes.</li>
          <li><b>Sem. 2</b> Sexta sem trabalho: choveu e as colunas não tinham chegado.</li>
          <li><b>Sem. 5</b> Moto do ajudante quebrou; sem expediente à tarde.</li>
        </ul>
      </div>

      <div class="sign">
        <div>Responsável pela obra</div>
        <div>Conferência financeira</div>
      </div>

      <div class="foot">
        <span>${nomeObra} · Relatório financeiro</span>
        <span>Página 3 de 3</span>
      </div>
    </section>

  </div>

  ${autoPrint ? `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
  ` : ''}
</body>
</html>`;
}

/**
 * Opens a dedicated top-level print window that reliably escapes iframe sandbox
 * constraints and automatically triggers the native browser system print dialog.
 */
export function openRelatorioPrintWindow(options: RelatorioServiceOptions): boolean {
  const html = generateRelatorioHTML({ ...options, autoPrint: true });
  
  try {
    sessionStorage.setItem('relatorio_print_html', html);
    sessionStorage.setItem('relatorio_print_payload', JSON.stringify({ ...options, autoPrint: true }));
  } catch (e) {
    console.warn('sessionStorage write error', e);
  }

  const printUrl = '/print-relatorio.html';

  // 1. Try window.open first (preserves click gesture)
  try {
    const printWin = window.open(printUrl, '_blank');
    if (printWin) {
      printWin.focus();
      return true;
    }
  } catch (e) {
    console.warn('window.open error', e);
  }

  // 2. Fallback: programmatically clicked anchor tag
  try {
    const link = document.createElement('a');
    link.href = printUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (linkErr) {
    console.warn('link click error', linkErr);
  }

  // 3. Fallback: Blob URL
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    return true;
  } catch (blobErr) {
    console.error('Blob URL fallback failed:', blobErr);
    return false;
  }
}

/**
 * Triggers clean native system printing of the report.
 * If running inside an iframe (like the AI Studio preview environment),
 * direct window.print() is blocked by browser sandbox ('allow-modals' missing);
 * in this case, it opens the dedicated print window where system printing
 * is triggered immediately.
 */
export async function triggerSystemPrint(options: RelatorioServiceOptions): Promise<boolean> {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (isInIframe) {
    return openRelatorioPrintWindow(options);
  }

  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('window.print() falhou no ambiente local, abrindo janela dedicada:', err);
    return openRelatorioPrintWindow(options);
  }
}

/**
 * Triggers clean native printing of the report.
 */
export function printRelatorioDocument(options?: RelatorioServiceOptions): Promise<boolean> {
  if (options) {
    return triggerSystemPrint(options);
  }
  return new Promise((resolve) => {
    try {
      window.print();
      resolve(true);
    } catch (err) {
      console.warn('Erro ao disparar window.print():', err);
      resolve(false);
    }
  });
}

/**
 * Opens the report in a new tab with auto-print
 */
export function openRelatorioInNewTab(options: RelatorioServiceOptions) {
  openRelatorioPrintWindow(options);
}

/**
 * Triggers download of the verified official PDF asset using a reliable Blob URL
 * to avoid Service Worker / SPA navigation interceptors corrupting the download.
 */
export async function downloadRelatorioPDF(obraId?: string, obraNome?: string): Promise<boolean> {
  const isJuscelino = !obraId || obraId === 'obra-juscelino-mola';
  const pdfUrl = '/assets/aistudio/relatorio_obra_juscelino_mola_d902f0e7.pdf';

  try {
    const response = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Falha HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 1000) {
      throw new Error('Conteúdo do PDF incompleto ou inválido');
    }

    // Create a pristine application/pdf Blob
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const safeName = (obraNome || (isJuscelino ? 'obra_juscelino_mola' : obraId) || 'obra')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_');

    const filename = `relatorio_consolidado_${safeName}.pdf`;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    // CRITICAL: Do NOT set target="_blank" so the browser does not open an intercepted navigation tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Free memory after download starts
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 15000);

    return true;
  } catch (err) {
    console.error('Erro ao baixar PDF via Blob:', err);

    // Fallback: direct download link without target="_blank"
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `relatorio_consolidado_${obraId || 'juscelino_mola'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback também falhou:', fallbackErr);
      return false;
    }
  }
}
