import { Avatar, cn } from "@heroui/react";

import { initials } from "@/lib/format";

/**
 * Tons dessaturados por paciente — o real usa `IdentityAvatar` com ring por
 * status; aqui não há eixo de cor por status (não existe mais), então a
 * variação fica só na identidade visual de cada card.
 */
const TINTS = [
  "bg-[oklch(0.94_0.03_174)] text-[oklch(0.38_0.07_174)]",
  "bg-[oklch(0.94_0.025_255)] text-[oklch(0.4_0.07_255)]",
  "bg-[oklch(0.945_0.03_75)] text-[oklch(0.42_0.075_60)]",
  "bg-[oklch(0.94_0.025_310)] text-[oklch(0.4_0.065_310)]",
] as const;

function tintFor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997;
  }
  return TINTS[hash % TINTS.length];
}

interface PatientAvatarProps {
  name: string;
  /** `sm` = 32px (tabela, igual ao `PersonCell`) · `card` = 56px (`IdentityAvatar` "ml", tamanho do card real). */
  size?: "sm" | "card";
  className?: string;
}

export function PatientAvatar({ name, size = "sm", className }: PatientAvatarProps) {
  return (
    <Avatar
      className={cn("shrink-0", size === "card" ? "size-14" : "size-8", className)}
    >
      <Avatar.Fallback
        className={cn(
          "font-semibold tracking-tight",
          size === "card" ? "text-base" : "text-xs",
          tintFor(name),
        )}
      >
        {initials(name)}
      </Avatar.Fallback>
    </Avatar>
  );
}
