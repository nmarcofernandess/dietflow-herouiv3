import { Button, SearchField, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import {
  Archive,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  SquareCheck,
} from "lucide-react";

import type { Location, PatientFilters, ViewMode } from "@/types/patient";

import { LocationFilter } from "./filters/LocationFilter";
import { ModificationFilter } from "./filters/ModificationFilter";
import { PlanoSemPlanoFilter } from "./filters/PlanoSemPlanoFilter";
import { TagsFilter } from "./filters/TagsFilter";

interface PatientToolbarProps {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  filtersExpanded: boolean;
  onFiltersExpandedChange: (expanded: boolean) => void;
  activeFiltersCount: number;
  locations: Location[];
  allTags: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  archivedCount: number;
}

/**
 * Réplica de `PatientFilterToolbar` (= `SearchFilterToolbar`) + os
 * `toolActions` reais de `PatientManagement`: busca à esquerda; à direita, o
 * botão "Filtros" (expande a linha 2 com borda-esquerda accent), o toggle de
 * seleção, o par Cards/Tabela e o botão "Arquivados (N)". Nada de popover de
 * status solto — esse filtro não existe no produto real.
 */
export function PatientToolbar({
  filters,
  onFiltersChange,
  filtersExpanded,
  onFiltersExpandedChange,
  activeFiltersCount,
  locations,
  allTags,
  viewMode,
  onViewModeChange,
  selectionMode,
  onToggleSelectionMode,
  archivedCount,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          aria-label="Buscar por nome, telefone, CPF, etc."
          className="min-w-0 flex-1"
          onChange={(value) => onFiltersChange({ ...filters, searchQuery: value })}
          value={filters.searchQuery}
        >
          <SearchField.Group>
            <SearchField.SearchIcon>
              <Search aria-hidden />
            </SearchField.SearchIcon>
            <SearchField.Input placeholder="Buscar por nome, telefone, CPF, etc." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            onPress={() => onFiltersExpandedChange(!filtersExpanded)}
            variant={filtersExpanded ? "primary" : "outline"}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            {activeFiltersCount > 0 ? `Filtros (${activeFiltersCount})` : "Filtros"}
          </Button>

          <Button
            aria-label={selectionMode ? "Sair da seleção" : "Selecionar itens"}
            isIconOnly
            onPress={onToggleSelectionMode}
            variant={selectionMode ? "primary" : "outline"}
          >
            <SquareCheck aria-hidden className="size-4" />
          </Button>

          <ToggleButtonGroup
            aria-label="Modo de visualização"
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const [first] = Array.from(keys);
              if (first) onViewModeChange(String(first) as ViewMode);
            }}
            selectedKeys={[viewMode]}
            selectionMode="single"
          >
            <ToggleButton aria-label="Cards (2 colunas)" id="cards">
              <LayoutGrid aria-hidden className="size-4" />
            </ToggleButton>
            <ToggleButton aria-label="Tabela" id="table">
              <List aria-hidden className="size-4" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            onPress={() =>
              onFiltersChange({ ...filters, showArchived: !filters.showArchived })
            }
            variant={filters.showArchived ? "primary" : "outline"}
          >
            <Archive aria-hidden className="size-4" />
            Arquivados ({archivedCount > 99 ? "99+" : archivedCount})
          </Button>
        </div>
      </div>

      {/* Linha 2: nasce só quando expandida, com a borda-esquerda accent do
          `CRUDToolbar` real — sinaliza visualmente que é filtro, não busca. */}
      {filtersExpanded ? (
        <div className="flex flex-wrap items-center gap-2 border-l-2 border-accent pl-4">
          <ModificationFilter
            onChange={(value) => onFiltersChange({ ...filters, ordenacao: value })}
            value={filters.ordenacao}
          />
          <LocationFilter
            locations={locations}
            onChange={(locationId) => onFiltersChange({ ...filters, locationId })}
            value={filters.locationId}
          />
          <PlanoSemPlanoFilter
            onChange={(withoutPlano) => onFiltersChange({ ...filters, withoutPlano })}
            value={filters.withoutPlano}
          />
          <TagsFilter
            allTags={allTags}
            onChange={(tags) => onFiltersChange({ ...filters, tags })}
            value={filters.tags}
          />
        </div>
      ) : null}
    </div>
  );
}
