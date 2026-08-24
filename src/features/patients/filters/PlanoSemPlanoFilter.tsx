import { CalendarCheck } from "lucide-react";

import { SelectionCheckbox } from "../SelectionCheckbox";
import { FacetPopover } from "./FacetPopover";

interface PlanoSemPlanoFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

/** Réplica de `CRUDPlanoSemPlanoFilter`: único recorte é "sem plano". */
export function PlanoSemPlanoFilter({ value, onChange }: PlanoSemPlanoFilterProps) {
  return (
    <FacetPopover
      buttonText="Plano"
      icon={<CalendarCheck aria-hidden className="size-4" />}
      isActive={value}
      title="Filtrar por plano"
    >
      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-secondary">
        <SelectionCheckbox aria-label="Sem plano" isSelected={value} onChange={onChange} />
        <span className="text-sm text-foreground">Sem plano de atendimento</span>
      </label>
    </FacetPopover>
  );
}
