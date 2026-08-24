import { RefreshCw } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

import { CenariosSection } from "./components/CenariosSection";
import { DecomposicaoCard } from "./components/DecomposicaoCard";
import { HeroVet } from "./components/HeroVet";
import { ParametrosSection } from "./components/ParametrosSection";
import { WeekEnergyChart } from "./components/WeekEnergyChart";
import { PACIENTE_DEMO, useCalculoState } from "./useCalculoState";

/*
 * Cálculo Nutricional — reimaginação da tela do DietFlow no layout da
 * referência (hero invertido + grade 65/35 + fileira de cards), com o motor
 * real portado e reativo.
 */
export function CalculoPage() {
  const { inputs, patch, toggleTreino, derivado, formulaEfetiva } = useCalculoState();

  return (
    <div className="bg-background min-h-dvh pb-24">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-accent text-xs font-semibold">
              {PACIENTE_DEMO.nome} · {PACIENTE_DEMO.idade} anos · {PACIENTE_DEMO.objetivoTag}
            </p>
            <h1 className="text-foreground mt-1.5 text-3xl font-semibold tracking-tight">
              Cálculo Nutricional
            </h1>
            <p className="text-muted mt-1.5 text-sm">
              Gasto energético, objetivo e distribuição de macros em um único plano.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted flex items-center gap-1.5 text-xs">
              <RefreshCw aria-hidden className="size-3.5" />
              Sincronizado com a antropometria de {PACIENTE_DEMO.antropometriaData}
            </p>
            <ThemeToggle />
          </div>
        </header>

        <HeroVet derivado={derivado} metaPeso={inputs.metaPeso} tempoSemanas={inputs.tempoSemanas} />

        <div className="grid items-stretch gap-4 lg:grid-cols-[1.85fr_1fr]">
          <WeekEnergyChart derivado={derivado} />
          <DecomposicaoCard derivado={derivado} />
        </div>

        <CenariosSection
          derivado={derivado}
          modo={inputs.modoCenarios}
          onModoChange={(modo) => patch("modoCenarios", modo)}
        />

        <ParametrosSection
          derivado={derivado}
          formulaEfetiva={formulaEfetiva}
          inputs={inputs}
          patch={patch}
          toggleTreino={toggleTreino}
        />
      </main>
    </div>
  );
}
