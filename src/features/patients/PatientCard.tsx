import { Card, cn } from "@heroui/react";
import type { KeyboardEvent, SyntheticEvent } from "react";

import { calcAge, formatLastVisit } from "@/lib/format";
import type { Patient } from "@/types/patient";

import { PatientActionsMenu } from "./PatientActionsMenu";
import { PatientAvatar } from "./PatientAvatar";
import { SelectionCheckbox } from "./SelectionCheckbox";

interface PatientCardProps {
  patient: Patient;
  showSelection: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string, isSelected: boolean) => void;
  onAccess: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onRestore: (patient: Patient) => void;
}

/**
 * Espelha `BaseContentCard` no uso real de `PatientCard.tsx`: avatar 56px à
 * esquerda, nome (até 2 linhas) + metadata "idade • último atendimento" à
 * direita, menu ⋮ sempre visível. Não existe chip de status, telefone,
 * e-mail, plano ou datas soltas no card — a tela real não mostra isso; quem
 * aprofunda é o perfil do paciente.
 *
 * Paciente arquivado é o real também: sem clique, sem menu — `dropdownActions`
 * fica `undefined` e `onClick` some quando `isInTrash`. Restaurar/excluir
 * permanente só existem no modo Tabela.
 *
 * O cartão inteiro é a área clicável (como no real: `Card` renderiza como
 * `div role="button"`, nunca um `<button>` nativo) porque o menu ⋮ e o
 * checkbox de seleção são filhos interativos — aninhar botão em botão
 * quebraria o HTML e o clique deles vazaria para o card.
 */
export function PatientCard({
  patient,
  showSelection,
  isSelected,
  onToggleSelect,
  onAccess,
  onEdit,
  onDelete,
  onRestore,
}: PatientCardProps) {
  const age = calcAge(patient.birthDate);
  const isInTrash = !patient.isActive;
  const isClickable = !isInTrash;

  const metadataParts = [
    `${age} anos`,
    patient.lastConsultationDate
      ? `Último atendimento ${formatLastVisit(patient.lastConsultationDate)}`
      : "Sem atendimento",
  ];

  const activate = () => {
    if (isInTrash) return;
    if (showSelection) onToggleSelect(patient.id, !isSelected);
    else onAccess(patient);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  };

  const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

  return (
    <Card
      aria-label={`Abrir ${patient.fullName}`}
      className={cn(
        // Contrato real do BaseContentCard: grid de 2 colunas (auto | 1fr),
        // não flex row. `flex` sozinho só liga display:flex — a classe
        // `.card` do HeroUI já vem com flex-direction:column, e sem um
        // `flex-row` explícito essa direção do componente prevalece (não é
        // disputa de especificidade, é ausência de override). Grid evita a
        // categoria inteira do problema.
        "group relative grid grid-cols-[auto_1fr] items-center gap-3 overflow-hidden p-4 outline-none transition-[box-shadow,background-color] duration-150",
        isInTrash
          ? "cursor-default opacity-70"
          : "cursor-pointer hover:shadow-sm focus-visible:ring-2 focus-visible:ring-focus",
        isSelected
          ? "border-transparent bg-accent-soft/40 shadow-md ring-2 ring-accent"
          : "border-border",
      )}
      onClick={activate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable ? 0 : -1}
    >
      <PatientAvatar className="shrink-0" name={patient.fullName} size="card" />

      {/* Coluna 2: título + metadata, cada um na sua própria linha — igual à
          coluna de conteúdo do BaseContentCard real. */}
      <div className={cn("flex min-w-0 flex-col gap-1", isClickable ? "pr-10" : "pr-2")}>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
          {patient.fullName}
        </h3>
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          {metadataParts.map((part, index) => (
            <span className="inline-flex items-center gap-2" key={part}>
              {index > 0 ? (
                <span aria-hidden className="select-none text-border-secondary">
                  ·
                </span>
              ) : null}
              <span className="tnum">{part}</span>
            </span>
          ))}
        </p>
      </div>

      {/* Indicador de seleção: canto superior direito, só existe em modo de
          seleção — replica `showSelection && selectionMode === "multiple"` do
          BaseContentCard real. Sempre visível quando selecionado; some no
          resto até o hover, para não competir com o menu ⋮. Paciente
          arquivado não seleciona: não há bulk action que se aplique a ele
          nesta tela. */}
      {showSelection && isClickable ? (
        <div
          className={cn(
            "absolute right-3 top-3 z-10 transition-opacity duration-150",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <SelectionCheckbox
            aria-label={`Selecionar ${patient.fullName}`}
            isSelected={isSelected}
            onChange={(next) => onToggleSelect(patient.id, next)}
          />
        </div>
      ) : null}

      {isClickable ? (
        <div
          className="absolute bottom-3 right-3"
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <PatientActionsMenu
            onAccess={onAccess}
            onDelete={onDelete}
            onEdit={onEdit}
            onRestore={onRestore}
            patient={patient}
          />
        </div>
      ) : null}
    </Card>
  );
}
