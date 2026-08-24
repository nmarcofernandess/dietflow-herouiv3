/**
 * Modelo espelhado do `Patient` real do DietFlow (prisma/schema.prisma).
 *
 * NÃO existe `Patient.status`. O enum foi removido do schema com a nota
 * "não recriar" — "ativo / arquivado" é o eixo `archivedAt`, e `isActive` é
 * apenas o espelho dele. Qualquer chip de "Ativo/Inativo/Novo" é resíduo.
 */
export type Gender = "MALE" | "FEMALE";

/** A toolbar oferece dois modos; o grid é sempre 1 coluna → 2 a partir de md. */
export type ViewMode = "cards" | "table";

/** Ordenação exposta pela faceta "Modificação". */
export type Ordenacao = "recentes" | "antigos";

export interface Location {
  id: string;
  name: string;
  addressCity: string;
}

export interface PlanoAtendimento {
  id: string;
  nome: string;
  frequenciaRetornoDias: number;
}

export interface Patient {
  id: string;
  /** Único campo textual obrigatório no banco. */
  fullName: string;
  email: string | null;
  /** Opcional desde a migration `patient_phone_optional`. */
  phone: string | null;
  /** Opcional; quando existe, é único entre os vivos. */
  cpf: string | null;
  /** ISO `yyyy-mm-dd`. Obrigatório. */
  birthDate: string;
  /** Obrigatório. O enum real não tem `OTHER`. */
  gender: Gender;
  instagramUsername: string | null;
  /** Array nativo Postgres com índice GIN; normalizado lowercase + trim + dedup. */
  tags: string[];
  locationId: string | null;
  planoAtendimentoId: string | null;
  /** Espelho de `archivedAt`: o CHECK do banco exige `archivedAt IS NULL <=> isActive`. */
  isActive: boolean;
  archivedAt: string | null;
  /** Denormalizado — quem escreve é a Agenda ao concluir o atendimento. */
  lastConsultationDate: string | null;
  /** Denormalizado — quem escreve é a Agenda ao agendar. */
  nextAppointmentDate: string | null;
  /** Usado só para a faceta de ordenação por modificação. */
  updatedAt: string;
}

/** Contrato de escrita do formulário — espelha o `patientWriteSchema`. */
export interface PatientDraft {
  fullName: string;
  birthDate: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  instagramUsername: string | null;
  tags: string[];
  locationId: string | null;
  planoAtendimentoId: string | null;
}

export interface PatientFilters {
  searchQuery: string;
  /** Alterna a listagem entre vivos e arquivados. Não é "status". */
  showArchived: boolean;
  locationId: string | null;
  /** Faceta "Plano": único filtro real é o recorte "sem plano". */
  withoutPlano: boolean;
  tags: string[];
  ordenacao: Ordenacao;
}

export const EMPTY_FILTERS: PatientFilters = {
  searchQuery: "",
  showArchived: false,
  locationId: null,
  withoutPlano: false,
  tags: [],
  ordenacao: "recentes",
};

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
};

/** Normalização de tag idêntica à do `normalizeTags` real. */
export function normalizeTags(input: string[]): string[] {
  const seen = new Set<string>();
  for (const raw of input) {
    const tag = raw.trim().toLowerCase();
    if (tag) seen.add(tag);
  }
  return [...seen];
}
