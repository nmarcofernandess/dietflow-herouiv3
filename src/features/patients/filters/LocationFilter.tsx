import { Check, MapPin } from "lucide-react";

import type { Location } from "@/types/patient";

import { FacetOptionRow, FacetPopover } from "./FacetPopover";

interface LocationFilterProps {
  locations: Location[];
  value: string | null;
  onChange: (locationId: string | null) => void;
}

/** Réplica de `CRUDLocationFilter`: lista de locais ativos + "Todos". */
export function LocationFilter({ locations, value, onChange }: LocationFilterProps) {
  const activeLabel = locations.find((location) => location.id === value)?.name;

  return (
    <FacetPopover
      buttonText={activeLabel ? `Local: ${activeLabel}` : "Local"}
      icon={<MapPin aria-hidden className="size-4" />}
      isActive={value !== null}
      title="Filtrar por local"
    >
      <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        <FacetOptionRow isSelected={value === null} onPress={() => onChange(null)}>
          <span className="flex-1">Todos</span>
          {value === null ? <Check aria-hidden className="size-4 text-accent" /> : null}
        </FacetOptionRow>
        {locations.map((location) => (
          <FacetOptionRow
            isSelected={value === location.id}
            key={location.id}
            onPress={() => onChange(location.id)}
          >
            <span className="min-w-0 flex-1 truncate">{location.name}</span>
            {value === location.id ? (
              <Check aria-hidden className="size-4 shrink-0 text-accent" />
            ) : null}
          </FacetOptionRow>
        ))}
      </div>
    </FacetPopover>
  );
}
