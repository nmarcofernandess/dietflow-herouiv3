import { Checkbox } from "@heroui/react";

interface SelectionCheckboxProps {
  "aria-label": string;
  /** Omitido quando o checkbox vive num slot de seleção do React Aria. */
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  slot?: "selection";
  className?: string;
}

/**
 * Mesmo checkbox em cards e tabela: a marca visual da seleção não pode mudar
 * conforme o modo de visualização.
 */
export function SelectionCheckbox({
  isSelected,
  onChange,
  slot,
  className,
  "aria-label": ariaLabel,
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      aria-label={ariaLabel}
      className={className}
      isSelected={isSelected}
      onChange={onChange}
      slot={slot}
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  );
}
