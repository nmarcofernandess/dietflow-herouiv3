import { Card } from "@heroui/react";

import type { CalculoDerivado } from "../useCalculoState";
import { kcalFmt } from "../motor";

/*
 * VET por dia da semana — barra empilhada (consumo base + compensação de
 * treino) com linha de referência da média semanal. Espelha o vetDiario do
 * produto: dias de treino comem mais.
 */

interface WeekEnergyChartProps {
  derivado: CalculoDerivado;
}

export function WeekEnergyChart({ derivado }: WeekEnergyChartProps) {
  const { energia, vetDiario } = derivado;
  const max = Math.max(...vetDiario.map((d) => d.total), 1);
  const mediaPct = (energia.vet / max) * 100;

  return (
    <Card className="gap-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Card.Header>
          <Card.Title className="text-lg leading-7 font-medium">
            Energia ao longo da semana
          </Card.Title>
          <Card.Description>VET de cada dia com a compensação dos treinos</Card.Description>
        </Card.Header>
        <p className="text-muted max-w-52 text-right text-xs leading-relaxed">
          A linha marca a média semanal de {kcalFmt(energia.vet)} kcal, aplicada quando o plano não
          separa dias.
        </p>
      </div>

      <Card.Content className="gap-5"><div>
        <p className="text-foreground text-4xl font-semibold tracking-tight tabular-nums">
          {kcalFmt(energia.get)}{" "}
          <span className="text-muted text-base font-normal tracking-normal">kcal</span>
        </p>
        <p className="text-muted mt-1 text-sm">Gasto energético total médio (GET)</p>
      </div>

      <div
        aria-label={`Valor energético por dia: ${vetDiario.map((d) => `${d.dia} ${kcalFmt(d.total)} kcal`).join(", ")}`}
        className="relative mt-2 h-44"
        role="img"
      >
        <div
          aria-hidden
          className="border-muted/50 absolute inset-x-0 z-10 border-t border-dashed"
          style={{ bottom: `${mediaPct}%` }}
        />
        <div className="flex h-full items-end gap-2 sm:gap-3">
          {vetDiario.map((dia) => {
            const basePct = ((dia.base + dia.ajuste) / max) * 100;
            const treinoPct = (dia.treino / max) * 100;
            return (
              <div
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                key={dia.dia}
                title={`${dia.dia}: ${kcalFmt(dia.total)} kcal${dia.treino > 0 ? ` (treino +${kcalFmt(dia.treino)})` : ""}`}
              >
                <span className="text-muted text-[10px] leading-none font-medium tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                  {kcalFmt(dia.total)}
                </span>
                <div className="flex w-full max-w-12 flex-col overflow-hidden rounded-md">
                  {dia.treino > 0 && (
                    <div
                      className="w-full transition-[height] duration-300"
                      style={{ backgroundColor: "var(--accent)", height: `${treinoPct * 1.76}px` }}
                    />
                  )}
                  <div
                    className="w-full transition-[height] duration-300"
                    style={{
                      backgroundColor: "var(--accent)",
                      opacity: 0.25,
                      height: `${basePct * 1.76}px`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2 sm:gap-3">
          {vetDiario.map((dia) => (
            <p className="text-muted flex-1 text-center text-[11px]" key={dia.dia}>
              {dia.dia}
            </p>
          ))}
        </div>
      </div>

      </Card.Content>

      <Card.Footer className="text-muted gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--accent)", opacity: 0.25 }}
          />
          Consumo base
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          Compensação de treino
        </span>
      </Card.Footer>
    </Card>
  );
}
