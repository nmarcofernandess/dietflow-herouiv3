import { Card, Chip } from "@heroui/react";
import { Flame } from "lucide-react";

import type { CalculoDerivado } from "../useCalculoState";
import { DIAS_SEMANA, g1Fmt, kcalFmt } from "../motor";
import { MacroRings } from "./MacroRings";

/*
 * Hero no padrão da referência: Card com tokens invertidos
 * (bg-foreground/text-background), número monumental e painel glass
 * (bg-background/10) para os anéis de macros.
 */

interface HeroVetProps {
  derivado: CalculoDerivado;
  metaPeso: number;
  tempoSemanas: number;
}

export function HeroVet({ derivado, metaPeso, tempoSemanas }: HeroVetProps) {
  const { energia, macros, vetDiario } = derivado;
  const deficit = energia.ajuste < 0;
  const manutencao = energia.ajuste === 0;

  const titulo = manutencao
    ? "Manutenção do peso atual"
    : `${deficit ? "Déficit" : "Superávit"} de ${kcalFmt(Math.abs(energia.ajuste))} kcal por dia`;

  const narrativa = manutencao
    ? "Consumo alinhado ao gasto energético total, sem meta de variação de peso."
    : `${metaPeso < 0 ? "Perder" : "Ganhar"} ${g1Fmt(Math.abs(metaPeso))} kg em ${tempoSemanas} semanas, com a compensação dos treinos preservada no plano.`;

  const diasComTreino = new Set(
    vetDiario.filter((d) => d.treino > 0).map((d) => d.dia),
  );

  return (
    <Card className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-0">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-xs font-medium opacity-60">
            <Flame aria-hidden className="size-3.5" />
            Meta calórica diária
          </p>

          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-8xl font-semibold tracking-[-0.06em] tabular-nums">
              {kcalFmt(energia.vet)}
            </span>
            <span className="text-xl font-medium opacity-50">kcal</span>
          </p>

          <h2 className="mt-3 text-xl font-medium">{titulo}</h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed opacity-60">{narrativa}</p>

          <div className="border-background/15 mt-auto grid grid-cols-3 gap-4 border-t pt-5 max-lg:mt-7">
            <div>
              <p className="text-xs opacity-50">TMB</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {kcalFmt(energia.tmb)} <span className="text-xs font-normal opacity-50">kcal</span>
              </p>
            </div>
            <div>
              <p className="text-xs opacity-50">Gasto total (GET)</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {kcalFmt(energia.get)} <span className="text-xs font-normal opacity-50">kcal</span>
              </p>
            </div>
            <div>
              <p className="text-xs opacity-50">Densidade</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {g1Fmt(energia.vetKg)}{" "}
                <span className="text-xs font-normal opacity-50">kcal/kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background/10 flex flex-col gap-4 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Distribuição de macros</h2>
              <p className="mt-0.5 text-xs opacity-60">
                Protocolo por densidade energética do VET
              </p>
            </div>
            <Chip className="border-background/25 text-background shrink-0" variant="soft">
              {macros.protocoloNome}
            </Chip>
          </div>

          <MacroRings macros={macros} vet={energia.vet} />

          <div className="border-background/15 mt-auto flex items-center justify-between border-t pt-4">
            <p className="text-xs opacity-60">Semana de treino</p>
            <div className="flex items-center gap-2">
              {DIAS_SEMANA.map((dia) => {
                const ativo = diasComTreino.has(dia);
                return (
                  <span className="flex flex-col items-center gap-1" key={dia}>
                    <span
                      aria-label={ativo ? `${dia}: treino` : `${dia}: descanso`}
                      className={`size-2.5 rounded-full ${ativo ? "" : "bg-background/20"}`}
                      style={ativo ? { backgroundColor: "var(--accent)" } : undefined}
                    />
                    <span className="text-[10px] leading-none opacity-45">{dia[0]}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
