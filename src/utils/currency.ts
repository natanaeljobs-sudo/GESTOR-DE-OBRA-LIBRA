/**
 * Currency utilities for Brazilian Real (BRL)
 */

export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrencyInput(val: string): number {
  if (!val) return 0;
  // Clean currency symbols and separators
  const clean = val
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Converts a number in BRL to written words (por extenso)
 * Required for official payment receipts
 */
export function valorPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais';
  if (isNaN(valor)) return '';

  const unidades = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'
  ];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
  ];

  function converteGrupo(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const du = n % 100;

    const partes: string[] = [];
    if (c > 0) partes.push(centenas[c]);

    if (du > 0) {
      if (du < 20) {
        partes.push(unidades[du]);
      } else {
        partes.push(dezenas[d]);
        if (u > 0) partes.push(unidades[u]);
      }
    }
    return partes.join(' e ');
  }

  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  const milhoes = Math.floor(inteiro / 1000000);
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  const resto = inteiro % 1000;

  const resultadoPartes: string[] = [];

  if (milhoes > 0) {
    resultadoPartes.push(`${converteGrupo(milhoes)} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }

  if (milhares > 0) {
    if (milhares === 1) {
      resultadoPartes.push('mil');
    } else {
      resultadoPartes.push(`${converteGrupo(milhares)} mil`);
    }
  }

  if (resto > 0) {
    resultadoPartes.push(converteGrupo(resto));
  }

  let textoReais = '';
  if (inteiro > 0) {
    textoReais = resultadoPartes.join(' e ') + (inteiro === 1 ? ' real' : ' reais');
  }

  let textoCentavos = '';
  if (centavos > 0) {
    textoCentavos = `${converteGrupo(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  if (textoReais && textoCentavos) {
    return `${textoReais} e ${textoCentavos}`;
  } else if (textoReais) {
    return textoReais;
  } else if (textoCentavos) {
    return textoCentavos;
  }

  return 'zero reais';
}
