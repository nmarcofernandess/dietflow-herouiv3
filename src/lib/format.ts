const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/**
 * Converte `yyyy-mm-dd` em Date local.
 * `new Date("2026-08-12")` seria meia-noite UTC — em BRT isso volta um dia e a
 * tela mostra 11 ago. Montar componente a componente mantém a data clínica.
 */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** `2026-08-12` -> `12 ago 2026`. */
export function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** `2026-08-12` -> `12/08/2026`. */
export function formatFullDate(iso: string): string {
  const date = parseISODate(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function calcAge(birthISO: string, today: Date = new Date()): number {
  const birth = parseISODate(birthISO);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Duas iniciais a partir do primeiro e do último nome. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara progressiva de telefone BR, tolerante a fixo (10) e celular (11). */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const areaCode = digits.slice(0, 2);
  const rest = digits.slice(2);
  const pivot = rest.length > 4 ? rest.length - 4 : rest.length;
  const head = rest.slice(0, pivot);
  const tail = rest.slice(pivot);
  return tail ? `(${areaCode}) ${head}-${tail}` : `(${areaCode}) ${head}`;
}

export function maskCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/**
 * Texto relativo de último atendimento, na mesma régua do `getLastVisitInfo`
 * do DietFlow: hoje · há 1 dia · há N dias (<30) · há N meses (<365) · há N anos.
 */
export function formatLastVisit(iso: string, today: Date = new Date()): string {
  const visit = parseISODate(iso);
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = Math.floor(
    (startOfToday.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 0) return "hoje";
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "há 1 mês" : `há ${months} meses`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

/**
 * Data relativa para a TABELA — algoritmo diferente do usado no card
 * (`formatLastVisit`): tem faixa de semanas e cobre datas futuras
 * ("Em X dias"/"Atrasado"). Espelha `formatRelativeDate` de
 * `DateCell.tsx` no DietFlow real — cada superfície tem seu próprio
 * relógio relativo, não é inconsistência desta demo.
 */
export function formatRelativeTableDate(
  iso: string | null,
  kind: "past" | "future",
  today: Date = new Date(),
): string {
  if (!iso) return kind === "past" ? "Sem registro" : "Sem agendamento";

  const target = parseISODate(iso);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs =
    kind === "past"
      ? startOfToday.getTime() - target.getTime()
      : target.getTime() - startOfToday.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return kind === "past" ? "Em breve" : "Atrasado";
  if (days === 0) return "Hoje";
  if (days === 1) return kind === "past" ? "Há 1 dia" : "Amanhã";
  if (days < 7) return kind === "past" ? `Há ${days} dias` : `Em ${days} dias`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const unit = weeks > 1 ? "semanas" : "semana";
    return kind === "past" ? `Há ${weeks} ${unit}` : `Em ${weeks} ${unit}`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    const unit = months > 1 ? "meses" : "mês";
    return kind === "past" ? `Há ${months} ${unit}` : `Em ${months} ${unit}`;
  }

  const years = Math.floor(days / 365);
  const unit = years > 1 ? "anos" : "ano";
  return kind === "past" ? `Há ${years} ${unit}` : `Em ${years} ${unit}`;
}

/** `2026-08-12` -> `12/08/26` — data absoluta curta da tabela. */
export function formatShortYearDate(iso: string | null): string {
  if (!iso) return "";
  const full = formatFullDate(iso);
  return `${full.slice(0, 6)}${full.slice(-2)}`;
}

/** Concordância de número — evita "1 pacientes" na barra de ferramentas. */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
