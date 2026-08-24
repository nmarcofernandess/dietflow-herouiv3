import { Button } from "@heroui/react";
import { UserPlus, UserRoundSearch } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

import { BulkActionsBar } from "./BulkActionsBar";
import { TagsBulkDialog } from "./dialogs/TagsBulkDialog";
import { LocationBulkDialog } from "./dialogs/LocationBulkDialog";
import { PlanoBulkDialog } from "./dialogs/PlanoBulkDialog";
import { PatientCard } from "./PatientCard";
import { PatientDeleteDialog } from "./PatientDeleteDialog";
import { PatientFormModal } from "./PatientFormModal";
import { PatientProfileDrawer } from "./PatientProfileDrawer";
import { PatientToolbar } from "./PatientToolbar";
import { PatientsTable } from "./PatientsTable";
import { usePatientsState } from "./usePatientsState";

export function PatientsPage() {
  // Fonte única de verdade da tela: cards, tabela, barra de seleção, drawer e
  // modais consomem este mesmo estado. Não existe cópia local.
  const state = usePatientsState();

  const {
    locations,
    planos,
    allTags,
    counts,
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
    toggleSelectionMode,
    openRegister,
    openTagsDialog,
    openLocationDialog,
    openPlanoDialog,
    requestDelete,
    closeDialog,
    savePatient,
    restorePatients,
    confirmDeleteDialog,
    applyBulkTags,
    applyBulkLocation,
    applyBulkPlano,
    resetDemo,
    setOpenPatientId,
  } = state;

  const hasResults = filteredPatients.length > 0;
  const isFiltering = filters.searchQuery.trim().length > 0 || activeFiltersCount > 0;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        {/* Header — espelha `CRUDHeader mode="title"`: título fixo "Pacientes",
            sem descrição, ação primária à direita. Não muda ao ver Arquivados
            (PatientManagement não passa `showArchived` ao header). */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Pacientes
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onPress={() => openRegister(null)}>
              <UserPlus aria-hidden className="size-4" />
              Novo Paciente
            </Button>
          </div>
        </header>

        <div className="mt-6">
          <PatientToolbar
            activeFiltersCount={activeFiltersCount}
            allTags={allTags}
            archivedCount={counts.archived}
            filters={filters}
            filtersExpanded={filtersExpanded}
            locations={locations}
            onFiltersChange={setFilters}
            onFiltersExpandedChange={setFiltersExpanded}
            onToggleSelectionMode={toggleSelectionMode}
            onViewModeChange={setViewMode}
            selectionMode={selectionMode}
            viewMode={viewMode}
          />
        </div>

        {activeFiltersCount > 0 ? (
          <div className="mt-3 flex justify-end">
            <Button onPress={clearFilters} size="sm" variant="ghost">
              Limpar Filtros
            </Button>
          </div>
        ) : null}

        <main className="mt-4">
          {hasResults ? (
            viewMode === "cards" ? (
              // getGridClass() real: 'grid-cols-1 md:grid-cols-2' sempre —
              // 3x3/2x2/1x1 são sinônimos no layout, por isso a toolbar só
              // oferece Cards/Tabela.
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredPatients.map((patient) => (
                  <PatientCard
                    isSelected={selectedIds.has(patient.id)}
                    key={patient.id}
                    onAccess={(target) => setOpenPatientId(target.id)}
                    onDelete={(target) => requestDelete([target])}
                    onEdit={openRegister}
                    onRestore={(target) => restorePatients([target])}
                    onToggleSelect={togglePatient}
                    patient={patient}
                    showSelection={selectionMode}
                  />
                ))}
              </div>
            ) : (
              <PatientsTable
                locations={locations}
                onAccess={(target) => setOpenPatientId(target.id)}
                onDelete={(target) => requestDelete([target])}
                onEdit={openRegister}
                onRestore={(target) => restorePatients([target])}
                onSelectionChange={setSelectionFromTable}
                patients={filteredPatients}
                selectedKeys={visibleSelectedKeys}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-surface px-6 py-16 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
                <UserRoundSearch aria-hidden className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                {filters.showArchived
                  ? "Nenhum paciente arquivado"
                  : isFiltering
                    ? "Nenhum paciente encontrado"
                    : "Sua carteira está vazia"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {isFiltering
                  ? "Ajuste a busca ou os filtros para encontrar quem você procura."
                  : filters.showArchived
                    ? "Pacientes arquivados aparecem aqui."
                    : "Cadastre o primeiro paciente para começar o acompanhamento."}
              </p>
              {!filters.showArchived ? (
                <div className="mt-5">
                  {isFiltering ? (
                    <Button onPress={clearFilters} variant="outline">
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button onPress={() => openRegister(null)}>
                      <UserPlus aria-hidden className="size-4" />
                      Novo Paciente
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>

      <BulkActionsBar
        isAllWindowSelected={isAllWindowSelected}
        isSomeWindowSelected={isSomeWindowSelected}
        onLocation={openLocationDialog}
        onPlano={openPlanoDialog}
        onTags={openTagsDialog}
        onToggleAll={toggleAllInWindow}
        selectedPatients={selectedPatients}
        selectionMode={selectionMode}
        windowCount={filteredPatients.length}
      />

      <PatientFormModal
        isOpen={dialog.kind === "register"}
        locations={locations}
        onClose={closeDialog}
        onSubmit={savePatient}
        patient={dialog.kind === "register" ? dialog.patient : null}
        planos={planos}
      />

      <PatientDeleteDialog
        isOpen={dialog.kind === "delete"}
        isPermanent={dialog.kind === "delete" ? dialog.isPermanent : false}
        onClose={closeDialog}
        onConfirm={confirmDeleteDialog}
        patients={dialog.kind === "delete" ? dialog.patients : []}
      />

      <TagsBulkDialog
        allTags={allTags}
        isOpen={dialog.kind === "tags"}
        onApply={applyBulkTags}
        onClose={closeDialog}
        patients={dialog.kind === "tags" ? dialog.patients : []}
      />

      <LocationBulkDialog
        isOpen={dialog.kind === "location"}
        locations={locations}
        onApply={applyBulkLocation}
        onClose={closeDialog}
        patients={dialog.kind === "location" ? dialog.patients : []}
      />

      <PlanoBulkDialog
        isOpen={dialog.kind === "plano"}
        onApply={applyBulkPlano}
        onClose={closeDialog}
        patients={dialog.kind === "plano" ? dialog.patients : []}
        planos={planos}
      />

      <PatientProfileDrawer
        locations={locations}
        onClose={() => setOpenPatientId(null)}
        onEdit={openRegister}
        patient={openPatient}
        planos={planos}
      />

      {/* Botão de restaurar o dataset da demo — não existe no produto real;
          é ferramenta desta demonstração, deixada visível e nomeada como tal. */}
      <div className="fixed bottom-4 left-4 z-30">
        <Button
          className="border border-border bg-surface shadow-sm"
          onPress={resetDemo}
          size="sm"
          variant="outline"
        >
          Restaurar dados de demonstração
        </Button>
      </div>
    </div>
  );
}
