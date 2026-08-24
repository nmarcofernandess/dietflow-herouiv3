import { Button, Checkbox, Separator } from "@heroui/react";
import { ArrowLeftRight, CalendarCheck, Tag } from "lucide-react";

import type { Patient } from "@/types/patient";

interface BulkActionsBarProps {
  selectionMode: boolean;
  selectedPatients: Patient[];
  windowCount: number;
  isAllWindowSelected: boolean;
  isSomeWindowSelected: boolean;
  onToggleAll: () => void;
  onTags: (patients: Patient[]) => void;
  onLocation: (patients: Patient[]) => void;
  onPlano: (patients: Patient[]) => void;
}

/**
 * Réplica de `CRUDBulkActionBar` para Pacientes. O bar real NÃO tem botão de
 * excluir/arquivar em massa — `enableBuiltInDelete` nunca é passado por
 * `PatientManagement`, então as três únicas ações são Gerenciar Tags, Migrar
 * Local e Gerenciar planos. Exclusão e arquivamento continuam sendo decisão
 * item a item, no menu ⋮ de cada paciente.
 *
 * O checkbox mestre é window-scoped (marca só o que a busca/filtro mostra
 * agora); o contador e as três ações leem o universo — um paciente
 * selecionado que saiu da busca continua no lote.
 */
export function BulkActionsBar({
  selectionMode,
  selectedPatients,
  windowCount,
  isAllWindowSelected,
  isSomeWindowSelected,
  onToggleAll,
  onTags,
  onLocation,
  onPlano,
}: BulkActionsBarProps) {
  if (!selectionMode) return null;
  if (windowCount === 0 && selectedPatients.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 shadow-lg shadow-black/5">
        <Checkbox
          aria-label="Selecionar todos os pacientes visíveis"
          isIndeterminate={isSomeWindowSelected}
          isSelected={isAllWindowSelected}
          onChange={onToggleAll}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <span className="text-sm font-medium text-foreground tnum">
              {selectedPatients.length} de {windowCount}{" "}
              {windowCount === 1 ? "paciente" : "pacientes"}
            </span>
          </Checkbox.Content>
        </Checkbox>

        <Separator className="h-5" orientation="vertical" />

        <Button
          isDisabled={selectedPatients.length === 0}
          onPress={() => onTags(selectedPatients)}
          size="sm"
          variant="ghost"
        >
          <Tag aria-hidden className="size-4" />
          Gerenciar Tags
        </Button>
        <Button
          isDisabled={selectedPatients.length === 0}
          onPress={() => onLocation(selectedPatients)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftRight aria-hidden className="size-4" />
          Migrar Local
        </Button>
        <Button
          isDisabled={selectedPatients.length === 0}
          onPress={() => onPlano(selectedPatients)}
          size="sm"
          variant="ghost"
        >
          <CalendarCheck aria-hidden className="size-4" />
          Gerenciar planos
        </Button>
      </div>
    </div>
  );
}
