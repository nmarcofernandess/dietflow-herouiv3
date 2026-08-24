import { Card, Chip, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { CalendarDays, Coffee, Dumbbell, Sunrise } from "lucide-react";

import type { CalculoDerivado } from "../useCalculoState";
import type { ModoCenarios } from "../motor";
import { kcalFmt } from "../motor";

/*
 * Cenários de consumo — grupos de dias com o mesmo VET, no formato dos cards
 * pequenos da referência. O seletor expõe os três modos reais da engine
 * (a UI de produção roda sempre no básico).
 */

const MODOS: { id: ModoCenarios; rotulo: string }[] = [
  { id: "basico", rotulo: "Básico" },
  { id: "otimizado", rotulo: "Otimizado" },
  { id: "sistematico", rotulo: "Sistemático" },
];

const DESCRICAO_MODO: Record<ModoCenarios, string> = {
  basico: "Um único VET médio para a semana inteira",
  otimizado: "Separa dias com treino significativo (acima de 10% da TMB) dos dias de descanso",
  sistematico: "Agrupa os treinos por período do dia, com um cenário por período",
};

interface CenariosSectionProps {
  derivado: CalculoDerivado;
  modo: ModoCenarios;
  onModoChange: (modo: ModoCenarios) => void;
}

export function CenariosSection({ derivado, modo, onModoChange }: CenariosSectionProps) {
  const { cenarios } = derivado;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-semibold">Cenários de consumo</h2>
          <p className="text-muted mt-0.5 text-sm">{DESCRICAO_MODO[modo]}</p>
        </div>
        <ToggleButtonGroup
          aria-label="Modo de geração de cenários"
          disallowEmptySelection
          onSelectionChange={(keys) => {
            const [primeiro] = Array.from(keys);
            if (primeiro) onModoChange(String(primeiro) as ModoCenarios);
          }}
          selectedKeys={[modo]}
          selectionMode="single"
        >
          {MODOS.map((m) => (
            <ToggleButton id={m.id} key={m.id}>
              {m.rotulo}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cenarios.map((cenario) => {
          const Icone = cenario.comTreino
            ? cenario.periodo === "Manhã"
              ? Sunrise
              : Dumbbell
            : cenario.dias.length === 7
              ? CalendarDays
              : Coffee;
          return (
            <Card className="flex flex-col gap-3 rounded-2xl p-5" key={cenario.nome}>
              <div className="flex items-start justify-between gap-2">
                <span className="bg-surface-secondary border-border flex size-9 items-center justify-center rounded-full border">
                  <Icone aria-hidden className="text-muted size-4" />
                </span>
                <Chip size="sm" variant="secondary">
                  {cenario.dias.length === 7
                    ? "Semana inteira"
                    : `${cenario.dias.length} ${cenario.dias.length === 1 ? "dia" : "dias"}`}
                </Chip>
              </div>

              <div>
                <h3 className="text-foreground text-base font-semibold">{cenario.nome}</h3>
                <p className="text-muted mt-0.5 text-xs tracking-wide">
                  {cenario.dias.join(" · ")}
                </p>
              </div>

              <div className="border-border mt-auto flex items-baseline justify-between border-t pt-3">
                <p className="text-muted text-xs">
                  {cenario.gmt > 0 ? `Treino +${kcalFmt(cenario.gmt)} kcal` : "Sem treino"}
                </p>
                <p className="text-foreground text-sm font-semibold tabular-nums">
                  {kcalFmt(cenario.vet)} <span className="text-muted text-xs font-normal">kcal</span>
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
