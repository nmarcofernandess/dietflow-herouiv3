import { toast } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MOCK_LOCATIONS, MOCK_PATIENTS, MOCK_PLANOS } from "@/data/patients";
import { onlyDigits } from "@/lib/format";
import {
  EMPTY_FILTERS,
  normalizeTags,
  type Patient,
  type PatientDraft,
  type PatientFilters,
  type ViewMode,
} from "@/types/patient";

// Versionada: se o shape de `Patient` mudar de novo, o sufixo muda e o
// localStorage antigo (de uma versão anterior desta demo) é ignorado em vez
// de voltar como "verdade" com campos faltando.
const STORAGE_KEY = "dietflow-demo:pacientes:v2";
const VIEW_MODE_KEY = "dietflow:viewMode";

/**
 * Overlays modais. União discriminada porque dois nunca coexistem — e porque o
 * verbo destrutivo muda de significado conforme o paciente estiver ativo ou
 * arquivado, então o alvo precisa viajar junto do tipo.
 */
type DialogState =
  | { kind: "none" }
  | { kind: "register"; patient: Patient | null }
  | { kind: "delete"; patients: Patient[]; isPermanent: boolean }
  | { kind: "tags"; patients: Patient[] }
  | { kind: "location"; patients: Patient[] }
  | { kind: "plano"; patients: Patient[] };

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Guarda mínima de shape — sem isso, um localStorage de versão anterior
 * desta demo (schema diferente) passa como válido e quebra em runtime. */
function isPatientShaped(value: unknown): value is Patient {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "fullName" in value &&
    Array.isArray((value as { tags?: unknown }).tags)
  );
}

function loadPatients(): Patient[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_PATIENTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return MOCK_PATIENTS;
    if (!parsed.every(isPatientShaped)) return MOCK_PATIENTS;
    return parsed;
  } catch {
    return MOCK_PATIENTS;
  }
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function usePatientsState() {
  const [patients, setPatients] = useState<Patient[]>(loadPatients);
  const [filters, setFilters] = useState<PatientFilters>(EMPTY_FILTERS);
  const [viewMode, setViewModeState] = useState<ViewMode>("cards");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  /**
   * Seleção é MODO, não estado permanente: os checkboxes só existem depois do
   * botão de seleção. É o contrato do `showSelection`/`onEnterSelectionMode`.
   */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  /** Simula a navegação do card para o dashboard do paciente. */
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  // O modo inicial é igual no servidor e no cliente; o storage entra depois.
  // Mesma razão do original: evitar divergência de hidratação.
  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_MODE_KEY);
    if (stored === "table" || stored === "cards") setViewModeState(stored);
    else if (stored === "2x2") setViewModeState("cards"); // alias legado
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

  const allTags = useMemo(() => {
    const pool = new Set<string>();
    patients.forEach((patient) => patient.tags.forEach((tag) => pool.add(tag)));
    return [...pool].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [patients]);

  const counts = useMemo(
    () => ({
      active: patients.filter((patient) => patient.isActive).length,
      archived: patients.filter((patient) => !patient.isActive).length,
    }),
    [patients],
  );

  /** Universo da aba corrente (antes da busca e das facetas). */
  const tabPatients = useMemo(
    () => patients.filter((patient) => patient.isActive !== filters.showArchived),
    [patients, filters.showArchived],
  );

  const filteredPatients = useMemo(() => {
    const term = normalize(filters.searchQuery);
    const termDigits = onlyDigits(filters.searchQuery);

    const result = tabPatients.filter((patient) => {
      if (filters.locationId && patient.locationId !== filters.locationId) return false;
      if (filters.withoutPlano && patient.planoAtendimentoId !== null) return false;
      if (
        filters.tags.length > 0 &&
        !filters.tags.every((tag) => patient.tags.includes(tag))
      ) {
        return false;
      }
      if (!term) return true;

      // Busca textual do original: nome, telefone, CPF e equivalentes.
      const matchesText =
        normalize(patient.fullName).includes(term) ||
        normalize(patient.email ?? "").includes(term);
      const matchesDigits =
        termDigits.length > 0 &&
        (onlyDigits(patient.phone ?? "").includes(termDigits) ||
          onlyDigits(patient.cpf ?? "").includes(termDigits));

      return matchesText || matchesDigits;
    });

    return result.sort((a, b) =>
      filters.ordenacao === "recentes"
        ? b.updatedAt.localeCompare(a.updatedAt)
        : a.updatedAt.localeCompare(b.updatedAt),
    );
  }, [tabPatients, filters]);

  const activeFiltersCount =
    (filters.locationId ? 1 : 0) +
    (filters.withoutPlano ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0) +
    (filters.ordenacao !== "recentes" ? 1 : 0);

  const windowIds = useMemo(
    () => filteredPatients.map((patient) => patient.id),
    [filteredPatients],
  );

  /**
   * Contrato universo × janela: o master marca só a JANELA (o que a busca
   * mostra agora), mas o contador e as ações leem o UNIVERSO — um paciente
   * selecionado que saiu da busca não pode sumir do lote em silêncio.
   */
  const selectedPatients = useMemo(
    () => patients.filter((patient) => selectedIds.has(patient.id)),
    [patients, selectedIds],
  );

  const windowSelectedCount = windowIds.filter((id) => selectedIds.has(id)).length;
  const isAllWindowSelected =
    windowIds.length > 0 && windowSelectedCount === windowIds.length;
  const isSomeWindowSelected =
    windowSelectedCount > 0 && windowSelectedCount < windowIds.length;

  const visibleSelectedKeys = useMemo<Selection>(
    () => new Set(windowIds.filter((id) => selectedIds.has(id))),
    [windowIds, selectedIds],
  );

  const openPatient = useMemo(
    () => patients.find((patient) => patient.id === openPatientId) ?? null,
    [patients, openPatientId],
  );

  const togglePatient = useCallback((id: string, isSelected: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const setSelectionFromTable = useCallback(
    (keys: Selection) => {
      setSelectedIds((previous) => {
        const visible = new Set(windowIds);
        const next = new Set([...previous].filter((id) => !visible.has(id)));
        if (keys === "all") visible.forEach((id) => next.add(id));
        else keys.forEach((key) => next.add(String(key)));
        return next;
      });
    },
    [windowIds],
  );

  /** Master é window-scoped: nunca apaga seleção acumulada fora da janela. */
  const toggleAllInWindow = useCallback(() => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      const allSelected = windowIds.every((id) => next.has(id));
      windowIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, [windowIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((previous) => {
      if (previous) setSelectedIds(new Set());
      return !previous;
    });
  }, []);

  const closeDialog = useCallback(() => setDialog({ kind: "none" }), []);

  const openRegister = useCallback(
    (patient: Patient | null) => setDialog({ kind: "register", patient }),
    [],
  );

  /**
   * Seleção mista é barrada: o verbo destrutivo muda de significado entre
   * ativo (excluir) e arquivado (excluir permanentemente), então um lote misto
   * não tem uma ação única honesta.
   */
  const requestDelete = useCallback((targets: Patient[]) => {
    if (targets.length === 0) return;
    const hasActive = targets.some((patient) => patient.isActive);
    const hasArchived = targets.some((patient) => !patient.isActive);

    if (hasActive && hasArchived) {
      toast.danger("Seleção mista", {
        description:
          "Separe ativos e arquivados: a exclusão significa coisas diferentes em cada aba.",
      });
      return;
    }

    setDialog({ kind: "delete", patients: targets, isPermanent: hasArchived });
  }, []);

  const savePatient = useCallback((draft: PatientDraft, id: string | null) => {
    const tags = normalizeTags(draft.tags);
    if (id) {
      setPatients((previous) =>
        previous.map((patient) =>
          patient.id === id
            ? { ...patient, ...draft, tags, updatedAt: TODAY_ISO }
            : patient,
        ),
      );
      toast.success("Cadastro atualizado", { description: draft.fullName });
    } else {
      const patient: Patient = {
        ...draft,
        tags,
        id: `pac-${crypto.randomUUID()}`,
        isActive: true,
        archivedAt: null,
        lastConsultationDate: null,
        nextAppointmentDate: null,
        updatedAt: TODAY_ISO,
      };
      setPatients((previous) => [patient, ...previous]);
      toast.success("Paciente cadastrado", { description: draft.fullName });
    }
    setDialog({ kind: "none" });
  }, []);

  /** `archivePatient` — move para Arquivados; espelha `isActive`. */
  const archivePatients = useCallback((targets: Patient[]) => {
    if (targets.length === 0) return;
    const ids = new Set(targets.map((patient) => patient.id));
    setPatients((previous) =>
      previous.map((patient) =>
        ids.has(patient.id)
          ? { ...patient, isActive: false, archivedAt: TODAY_ISO, updatedAt: TODAY_ISO }
          : patient,
      ),
    );
    setSelectedIds(new Set());
    toast("Arquivamento concluído", {
      description:
        targets.length === 1
          ? `${targets[0].fullName} foi para Arquivados.`
          : `${targets.length} pacientes foram para Arquivados.`,
    });
  }, []);

  /** `unarchivePatient` — não toca em nenhum outro eixo do ciclo de vida. */
  const restorePatients = useCallback((targets: Patient[]) => {
    if (targets.length === 0) return;
    const ids = new Set(targets.map((patient) => patient.id));
    setPatients((previous) =>
      previous.map((patient) =>
        ids.has(patient.id)
          ? { ...patient, isActive: true, archivedAt: null, updatedAt: TODAY_ISO }
          : patient,
      ),
    );
    setSelectedIds(new Set());
    toast.success("Restauração concluída", {
      description:
        targets.length === 1
          ? `${targets[0].fullName} voltou para a carteira.`
          : `${targets.length} pacientes voltaram para a carteira.`,
    });
  }, []);

  /**
   * `deletePatient` real é soft: a row persiste com `deletedAt`, some da UI
   * do dono e mata o login do paciente no Care. Nesta demo em memória o
   * efeito observável é o mesmo que importa para quem está vendo a tela: o
   * paciente sai da lista e dos Arquivados.
   */
  const hardDeletePatients = useCallback((targets: Patient[]) => {
    const ids = new Set(targets.map((patient) => patient.id));
    setPatients((previous) => previous.filter((patient) => !ids.has(patient.id)));
    setSelectedIds((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setOpenPatientId((previous) => (previous && ids.has(previous) ? null : previous));
  }, []);

  /**
   * O botão do diálogo despacha para o efeito real, não para o rótulo do menu
   * que abriu o diálogo: "Excluir paciente" num paciente ativo arquiva
   * (`isPermanent=false`); só o paciente já arquivado tem `isPermanent=true`.
   */
  const confirmDeleteDialog = useCallback(
    (targets: Patient[], isPermanent: boolean) => {
      if (isPermanent) {
        hardDeletePatients(targets);
        toast.danger("Exclusão concluída", {
          description:
            targets.length === 1
              ? `${targets[0].fullName} saiu da lista e dos Arquivados.`
              : `${targets.length} pacientes saíram da lista e dos Arquivados.`,
        });
      } else {
        archivePatients(targets);
      }
      setDialog({ kind: "none" });
    },
    [hardDeletePatients],
  );

  const applyBulkTags = useCallback(
    (targets: Patient[], tagsToAdd: string[], tagsToRemove: string[]) => {
      const ids = new Set(targets.map((patient) => patient.id));
      const removal = new Set(normalizeTags(tagsToRemove));
      setPatients((previous) =>
        previous.map((patient) =>
          ids.has(patient.id)
            ? {
                ...patient,
                tags: normalizeTags([
                  ...patient.tags.filter((tag) => !removal.has(tag)),
                  ...tagsToAdd,
                ]),
                updatedAt: TODAY_ISO,
              }
            : patient,
        ),
      );
      setDialog({ kind: "none" });
      setSelectedIds(new Set());
      toast.success("Tags atualizadas", {
        description: `${targets.length} paciente(s) atualizados.`,
      });
    },
    [],
  );

  const applyBulkLocation = useCallback((targets: Patient[], locationId: string) => {
    const ids = new Set(targets.map((patient) => patient.id));
    setPatients((previous) =>
      previous.map((patient) =>
        ids.has(patient.id)
          ? { ...patient, locationId, updatedAt: TODAY_ISO }
          : patient,
      ),
    );
    setDialog({ kind: "none" });
    setSelectedIds(new Set());
    const target = MOCK_LOCATIONS.find((location) => location.id === locationId);
    toast.success("Migração concluída", {
      description: `${targets.length} paciente(s) movidos para ${target?.name ?? "outro local"}.`,
    });
  }, []);

  const applyBulkPlano = useCallback(
    (targets: Patient[], planoAtendimentoId: string | null) => {
      const ids = new Set(targets.map((patient) => patient.id));
      setPatients((previous) =>
        previous.map((patient) =>
          ids.has(patient.id)
            ? { ...patient, planoAtendimentoId, updatedAt: TODAY_ISO }
            : patient,
        ),
      );
      setDialog({ kind: "none" });
      setSelectedIds(new Set());
      const plano = MOCK_PLANOS.find((item) => item.id === planoAtendimentoId);
      toast.success("Planos atualizados", {
        description: plano
          ? `${targets.length} paciente(s) em ${plano.nome}.`
          : `${targets.length} paciente(s) sem plano.`,
      });
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setPatients(MOCK_PATIENTS);
    setFilters(EMPTY_FILTERS);
    setSelectedIds(new Set());
    setSelectionMode(false);
    setOpenPatientId(null);
    setDialog({ kind: "none" });
    toast("Demonstração restaurada", {
      description: "A carteira voltou aos 12 pacientes de exemplo.",
    });
  }, []);

  const clearFilters = useCallback(
    () =>
      setFilters((previous) => ({
        ...previous,
        locationId: null,
        withoutPlano: false,
        tags: [],
        ordenacao: "recentes",
      })),
    [],
  );

  return {
    locations: MOCK_LOCATIONS,
    planos: MOCK_PLANOS,
    allTags,
    counts,
    patients,
    filteredPatients,
    filters,
    activeFiltersCount,
    filtersExpanded,
    viewMode,
    selectionMode,
    selectedIds,
    selectedPatients,
    visibleSelectedKeys,
    isAllWindowSelected,
    isSomeWindowSelected,
    dialog,
    openPatient,
    setFilters,
    setFiltersExpanded,
    setViewMode,
    clearFilters,
    togglePatient,
    setSelectionFromTable,
    toggleAllInWindow,
    clearSelection,
    toggleSelectionMode,
    openRegister,
    openTagsDialog: (targets: Patient[]) => setDialog({ kind: "tags", patients: targets }),
    openLocationDialog: (targets: Patient[]) =>
      setDialog({ kind: "location", patients: targets }),
    openPlanoDialog: (targets: Patient[]) =>
      setDialog({ kind: "plano", patients: targets }),
    requestDelete,
    closeDialog,
    savePatient,
    archivePatients,
    restorePatients,
    confirmDeleteDialog,
    applyBulkTags,
    applyBulkLocation,
    applyBulkPlano,
    resetDemo,
    setOpenPatientId,
  };
}

export type PatientsState = ReturnType<typeof usePatientsState>;
export type { DialogState };
