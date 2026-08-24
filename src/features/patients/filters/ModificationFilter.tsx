import { ArrowUpDown, Check } from "lucide-react";

import type { Ordenacao } from "@/types/patient";

import { FacetOptionRow, FacetPopover } from "./FacetPopover";

const OPTIONS: { key: Ordenacao; label: string }[] = [
  { key: "recentes", label: "Mais recentes" },
  { key: "antigos", label: "Mais antigos" },
];

interface ModificationFilterProps {
  value: Ordenacao;
  onChange: (value: Ordenacao) => void;
}

/** Réplica de `CRUDModificationFilter`: default é "recentes", sem chip de contagem. */
export function ModificationFilter({ value, onChange }: ModificationFilterProps) {
  const label = OPTIONS.find((option) => option.key === value)?.label ?? "Mais recentes";

  return (
    <FacetPopover
      buttonText={`Modificação: ${label}`}
      icon={<ArrowUpDown aria-hidden className="size-4" />}
      isActive={value !== "recentes"}
      title="Filtrar por modificação"
    >
      <div className="flex flex-col gap-0.5">
        {OPTIONS.map((option) => (
          <FacetOptionRow
            isSelected={value === option.key}
            key={option.key}
            onPress={() => onChange(option.key)}
          >
            <span className="flex-1">{option.label}</span>
            {value === option.key ? (
              <Check aria-hidden className="size-4 text-accent" />
            ) : null}
          </FacetOptionRow>
        ))}
      </div>
    </FacetPopover>
  );
}
