import { Card, ProgressBar, Separator } from "@heroui/react";
import { Activity, BedDouble, Dumbbell, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CalculoDerivado } from "../useCalculoState";
import { kcalFmt } from "../motor";

/*
 * Decomposição do gasto energético em linhas com barra de progresso — cada
 * componente (TMB, GEA, GMT, ajuste) proporcional ao GET, fechando no VET.
 */

interface LinhaProps {
  icone: LucideIcon;
  rotulo: string;
  descricao: string;
  valor: number;
  total: number;
  negativo?: boolean;
}

function Linha({ icone: Icone, rotulo, descricao, valor, total, negativo }: LinhaProps) {
  return (
    <li className="flex items-center gap-3.5">
      <span className="bg-surface-secondary border-border flex size-9 shrink-0 items-center justify-center rounded-full border">
        <Icone aria-hidden className="text-muted size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-foreground truncate text-sm font-medium">{rotulo}</p>
          <p
            className={`text-sm font-semibold tabular-nums ${negativo ? "text-danger" : "text-foreground"}`}
          >
            {negativo ? "−" : valor > 0 && rotulo !== "Taxa metabólica basal" ? "+" : ""}
            {kcalFmt(Math.abs(valor))}{" "}
            <span className="text-muted text-xs font-normal">kcal</span>
          </p>
        </div>
        <p className="text-muted mb-1.5 text-xs">{descricao}</p>
        <ProgressBar
          aria-label={rotulo}
          className="w-full"
          maxValue={total}
          value={Math.abs(valor)}
        >
          <ProgressBar.Track className="h-1.5">
            <ProgressBar.Fill className={negativo ? "bg-danger" : undefined} />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
    </li>
  );
}

interface DecomposicaoCardProps {
  derivado: CalculoDerivado;
}

export function DecomposicaoCard({ derivado }: DecomposicaoCardProps) {
  const { energia } = derivado;
  const total = energia.get;

  return (
    <Card className="flex h-full flex-col gap-5 rounded-2xl p-6">
      <div>
        <h3 className="text-foreground text-lg font-medium">Decomposição energética</h3>
        <p className="text-muted mt-0.5 text-sm">Como o VET é construído a partir do gasto</p>
      </div>

      <ul className="flex flex-1 flex-col justify-between gap-5">
        <Linha
          descricao="Gasto em repouso absoluto"
          icone={BedDouble}
          rotulo="Taxa metabólica basal"
          total={total}
          valor={energia.tmb}
        />
        <Linha
          descricao="Atividades do dia a dia (fator atividade)"
          icone={Activity}
          rotulo="Gasto por atividade"
          total={total}
          valor={energia.gea}
        />
        <Linha
          descricao="Média diária dos treinos contabilizados"
          icone={Dumbbell}
          rotulo="Gasto por treino"
          total={total}
          valor={energia.gmt}
        />
        <Linha
          descricao="Derivado da meta de peso e do prazo"
          icone={Target}
          negativo={energia.ajuste < 0}
          rotulo="Ajuste do objetivo"
          total={total}
          valor={energia.ajuste}
        />
      </ul>

      <Separator />

      <div className="flex items-baseline justify-between">
        <p className="text-foreground text-sm font-semibold">VET final</p>
        <p className="text-foreground text-xl font-semibold tabular-nums">
          {kcalFmt(energia.vet)} <span className="text-muted text-xs font-normal">kcal/dia</span>
        </p>
      </div>
    </Card>
  );
}
