import { ReciboPagamento } from '../types';
import { formatBRL } from './currency';

export interface ReciboPrintOptions {
  recibo: ReciboPagamento;
  obraNome: string;
  autoPrint?: boolean;
}

export function formatCityDateRecibo(dataISO: string, cidade: string): string {
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
}

function renderViaHTML(rec: ReciboPagamento, obraNome: string, viaLabel: string): string {
  const cpfFormatted = rec.trabalhadorCpf && rec.trabalhadorCpf !== 'Não informado' ? rec.trabalhadorCpf : '';
  const formattedDateCity = formatCityDateRecibo(rec.dataEmissao, rec.localCidade || 'Goiânia - GO');

  return `
    <div class="via">
      <div class="via-header">
        <div class="meta-left">
          <span class="num">${rec.numeroRecibo}</span>
          <span class="sep">·</span>
          <span class="obra">${obraNome}</span>
        </div>
        <div class="meta-right">
          <span class="badge">${viaLabel}</span>
        </div>
      </div>

      <div class="title-area">
        <h2>RECIBO DE PAGAMENTO</h2>
      </div>

      <div class="body-text">
        <p>
          Eu, <strong>${rec.trabalhadorNome.toUpperCase()}</strong>${
            cpfFormatted ? `, portador do CPF Nº <strong>${cpfFormatted}</strong>` : ''
          } recebi de <strong>${rec.responsavelNome.toUpperCase()}</strong>, a importância de <strong>${formatBRL(
            rec.valorTotal
          )}</strong> (${rec.valorPorExtenso}) referente à (${rec.motivo}).
        </p>
        ${
          rec.observacoes
            ? `<p class="obs"><strong>Obs:</strong> ${rec.observacoes}</p>`
            : ''
        }
      </div>

      <div class="signature-area">
        <p class="city-date">${formattedDateCity}</p>
        <div class="sign-block">
          <div class="line"></div>
          <p class="signer-name">${rec.trabalhadorNome.toUpperCase()}</p>
          <p class="signer-role">Assinatura do Recebedor${cpfFormatted ? ` · CPF: ${cpfFormatted}` : ''}</p>
        </div>
      </div>
    </div>
  `;
}

export function generateReciboHTML(options: ReciboPrintOptions): string {
  const { recibo, obraNome, autoPrint = false } = options;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Recibo de Pagamento · ${recibo.numeroRecibo}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
    html, body {
      background: #ffffff !important;
      color: #111c2d !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .sheet {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      min-height: 297mm;
      background: #ffffff;
      padding: 10mm 16mm;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .via {
      height: 132mm;
      max-height: 132mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 4mm 0;
      overflow: hidden;
    }

    .via-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    .meta-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .meta-left .num {
      font-family: monospace;
      font-weight: 700;
      color: #0085db;
      font-size: 11px;
    }
    .meta-left .sep {
      color: #94a3b8;
    }
    .meta-left .obra {
      font-weight: 600;
      color: #334155;
    }
    .badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 9px;
      border-radius: 99px;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    .title-area {
      text-align: center;
      margin: 10px 0;
    }
    .title-area h2 {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #111c2d;
      text-transform: uppercase;
    }

    .body-text {
      text-align: justify;
      font-size: 12px;
      line-height: 1.6;
      color: #111c2d;
      margin: 8px 0;
    }
    .body-text strong {
      font-weight: 700;
      color: #0f172a;
    }
    .body-text .obs {
      margin-top: 8px;
      font-size: 10px;
      color: #64748b;
      font-style: italic;
    }

    .signature-area {
      margin-top: 10px;
    }
    .city-date {
      text-align: right;
      font-size: 11px;
      font-weight: 600;
      color: #111c2d;
      margin-bottom: 30px;
    }
    .sign-block {
      max-width: 380px;
      margin: 0 auto;
      text-align: center;
    }
    .sign-block .line {
      border-top: 1.5px solid #0f172a;
      width: 100%;
      margin-bottom: 6px;
    }
    .sign-block .signer-name {
      font-size: 12px;
      font-weight: 700;
      color: #111c2d;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .sign-block .signer-role {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Cut line in the center */
    .cut-line-wrapper {
      height: 6mm;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      user-select: none;
    }
    .cut-line-wrapper .dash {
      width: 100%;
      border-top: 1px dashed #94a3b8;
    }
    .cut-line-wrapper .tag {
      position: absolute;
      background: #ffffff;
      padding: 0 12px;
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- 1ª Via (Superior) -->
    ${renderViaHTML(recibo, obraNome, '1ª Via · Pagador')}

    <!-- Linha de Corte Central -->
    <div class="cut-line-wrapper">
      <div class="dash"></div>
      <span class="tag">✂ Linha de corte · Separar as 2 vias ✂</span>
    </div>

    <!-- 2ª Via (Inferior) -->
    ${renderViaHTML(recibo, obraNome, '2ª Via · Recebedor')}
  </div>

  ${
    autoPrint
      ? `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.warn('Erro ao acionar window.print():', e);
        }
      }, 250);
    });
  </script>
  `
      : ''
  }
</body>
</html>`;
}

/**
 * Opens a dedicated receipt print window in a new tab with the print dialog
 * automatically triggered. This guarantees printing works even inside sandboxed
 * iframes (such as the AI Studio preview environment) where window.print() is blocked.
 */
export function openReciboPrintWindow(options: ReciboPrintOptions): boolean {
  const html = generateReciboHTML({ ...options, autoPrint: true });

  try {
    sessionStorage.setItem('recibo_print_html', html);
    sessionStorage.setItem('recibo_print_payload', JSON.stringify({ ...options, autoPrint: true }));
  } catch (e) {
    console.warn('sessionStorage write error', e);
  }

  const printUrl = '/print-recibo.html';

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
 * Triggers printing of the receipt.
 * If running inside an iframe (like the AI Studio preview environment), direct
 * window.print() is blocked by browser sandboxing ('allow-modals' missing);
 * in this case, it opens the dedicated print window where system printing
 * is triggered immediately.
 * In a top-level window, it triggers window.print() directly with dedicated print CSS.
 */
export async function triggerReciboInPagePrint(recibo: ReciboPagamento, obraNome: string): Promise<boolean> {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (isInIframe) {
    return openReciboPrintWindow({ recibo, obraNome, autoPrint: true });
  }

  // When not in iframe, try direct window.print() (styles are handled in @media print)
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('window.print() falhou, abrindo janela dedicada de recibo:', err);
    return openReciboPrintWindow({ recibo, obraNome, autoPrint: true });
  }
}

