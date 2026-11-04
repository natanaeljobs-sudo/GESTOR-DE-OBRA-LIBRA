/**
 * Date utilities with PT-BR locale and Monday-Sunday week calculations
 */

export function formatDateBR(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const parts = typeof dateStr === 'string' ? dateStr.split('T')[0].split('-') : null;
    if (parts && parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return String(dateStr);
  }
}

export function formatDateExtendedBR(dateStr: string | Date = new Date(), city = 'Goiânia - GO'): string {
  try {
    const d = typeof dateStr === 'string' ? new Date(`${dateStr}T12:00:00`) : dateStr;
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const dia = d.getDate();
    const mes = meses[d.getMonth()];
    const ano = d.getFullYear();
    return `${city}, ${dia} de ${mes} de ${ano}`;
  } catch {
    return `${city}, ${dateStr}`;
  }
}

export function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the Monday and Sunday for the week containing the given date.
 * ISO week: Monday (day 1) to Sunday (day 7).
 */
export function getWeekRange(dateStr: string | Date): {
  segunda: string;
  domingo: string;
  label: string;
  numeroSemana: number;
} {
  const d = typeof dateStr === 'string' ? new Date(`${dateStr}T12:00:00`) : new Date(dateStr);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayOfMonth}`;
  };

  // Calculate week number
  const firstJan = new Date(monday.getFullYear(), 0, 1);
  const dayNr = Math.ceil((((monday.getTime() - firstJan.getTime()) / 86400000) + firstJan.getDay() + 1) / 7);

  const segISO = toISO(monday);
  const domISO = toISO(sunday);

  return {
    segunda: segISO,
    domingo: domISO,
    numeroSemana: dayNr,
    label: `${formatDateBR(segISO)} a ${formatDateBR(domISO)}`,
  };
}

export function getDayOfWeekName(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[d.getDay()];
  } catch {
    return '';
  }
}
