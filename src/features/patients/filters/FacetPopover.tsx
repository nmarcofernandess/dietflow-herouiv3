import { Button, Popover, cn } from "@heroui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface FacetPopoverProps {
  /** Texto do botão-gatilho. Já inclui a contagem quando ativo (ex.: `Tags (2)`). */
  buttonText: string;
  icon: ReactNode;
  isActive: boolean;
  title: string;
  children: ReactNode;
  /** Chip "Limpar" no rodapé — só facetas multi-seleção (tags) precisam. */
  onClear?: () => void;
  clearDisabled?: boolean;
}

/**
 * Réplica do `FilterPopover` real: botão com ícone + texto que muda para
 * `accent` quando o filtro está ativo, abrindo um popover com título fixo e
 * conteúdo customizável. Toda faceta da toolbar (Modificação, Local, Plano,
 * Tags) nasce daqui — nunca um dropdown solto ao lado da busca.
 */
export function FacetPopover({
  buttonText,
  icon,
  isActive,
  title,
  children,
  onClear,
  clearDisabled,
}: FacetPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant={isActive ? "primary" : "outline"}>
        {icon}
        {buttonText}
        {isOpen ? (
          <ChevronUp aria-hidden className="size-3.5" />
        ) : (
          <ChevronDown aria-hidden className="size-3.5" />
        )}
      </Button>
      <Popover.Content placement="bottom start">
        <Popover.Dialog className="w-72 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {title}
          </p>
          <div className="mt-3">{children}</div>
          {onClear ? (
            <div className="mt-3 flex justify-end border-t border-separator pt-3">
              <Button
                isDisabled={clearDisabled}
                onPress={onClear}
                size="sm"
                variant="ghost"
              >
                Limpar
              </Button>
            </div>
          ) : null}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function FacetOptionRow({
  isSelected,
  onPress,
  children,
}: {
  isSelected: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        isSelected ? "bg-accent-soft text-accent-soft-foreground" : "hover:bg-surface-secondary",
      )}
      onClick={onPress}
      type="button"
    >
      {children}
    </button>
  );
}
