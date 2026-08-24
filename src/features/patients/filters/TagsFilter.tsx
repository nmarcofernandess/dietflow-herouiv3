import { Tag as TagIcon } from "lucide-react";

import { SelectionCheckbox } from "../SelectionCheckbox";
import { FacetPopover } from "./FacetPopover";

interface TagsFilterProps {
  allTags: string[];
  value: string[];
  onChange: (tags: string[]) => void;
}

/** Réplica de `CRUDTagsFilter`: multi-seleção com footer "Limpar". */
export function TagsFilter({ allTags, value, onChange }: TagsFilterProps) {
  const toggle = (tag: string) => {
    onChange(
      value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag],
    );
  };

  return (
    <FacetPopover
      buttonText={value.length > 0 ? `Tags (${value.length})` : "Tags"}
      clearDisabled={value.length === 0}
      icon={<TagIcon aria-hidden className="size-4" />}
      isActive={value.length > 0}
      onClear={() => onChange([])}
      title="Filtrar por tag"
    >
      {allTags.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma tag cadastrada ainda.</p>
      ) : (
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {allTags.map((tag) => (
            <label
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-secondary"
              key={tag}
            >
              <SelectionCheckbox
                aria-label={tag}
                isSelected={value.includes(tag)}
                onChange={() => toggle(tag)}
              />
              <span className="truncate text-sm text-foreground">{tag}</span>
            </label>
          ))}
        </div>
      )}
    </FacetPopover>
  );
}
