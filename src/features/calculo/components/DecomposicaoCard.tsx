import { Card, Label, Meter, Separator } from "@heroui/react";
import { Activity, BedDouble, Dumbbell, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CalculoDerivado } from "../useCalculoState";
import { kcalFmt } from "../motor";

/*
 * Decomposição do gasto energético. Cada componente (TMB, GEA, GMT, ajuste)
 * é uma medição dentro de um range conhecido — por isso Meter, não
 * ProgressBar (que comunica progresso de operação a tecnologias assistivas).
 */

interface LinhaProps {
  icone: LucideIcon;
  rotulo: string;
  descricao: string;
  valor: number;
  total: number;
  negativo?: boolean;
  comSinal?: boolean;
}

function Linha({ icone: Icone, rotulo, descricao, valor, total, negativo, comSinal }: LinhaProps) {
  return (
    <li className="flex items-center gap-3.5">
      <span className="bg-surface-secondary border-border flex size-9 shrink-0 items-center justify-center rounded-full border">
        <Icone aria-hidden className="text-muted size-4" />
      </span>
      <Meter
        className="w-full min-w-0 flex-1"
        color={negativo ? "danger" : "accent"}
        maxValue={total}
        size="sm"
        value={Math.abs(valor)}
      >
        <Label className="text-foreground truncate text-sm font-medium">{rotulo}</Label>
        <Meter.Output
          className={`text-sm font-semibold tabular-nums ${negativo ? "text-danger" : "text-foreground"}`}
        >
          {negativo ? "−" : comSinal ? "+" : ""}
          {kcalFmt(Math.abs(valor))}{" "}
          <span className="text-muted text-xs font-normal">kcal</span>
        </Meter.Output>
        <Meter.Track>
          <Meter.Fill />
        </Meter.Track>
        <p className="text-muted col-span-2 text-xs">{descricao}</p>
      </Meter>
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
    <Card className="h-full gap-5 rounded-2xl p-6">
      <Card.Header>
        <Card.Title className="text-lg leading-7 font-medium">
          Decomposição energética
        </Card.Title>
        <Card.Description>Como o VET é construído a partir do gasto</Card.Description>
      </Card.Header>

      <Card.Content className="gap-0">
        <ul className="flex h-full flex-col justify-between gap-5">
          <Linha
            descricao="Gasto em repouso absoluto"
            icone={BedDouble}
            rotulo="Taxa metabólica basal"
            total={total}
            valor={energia.tmb}
          />
          <Linha
            comSinal
            descricao="Atividades do dia a dia (fator atividade)"
            icone={Activity}
            rotulo="Gasto por atividade"
            total={total}
            valor={energia.gea}
          />
          <Linha
            comSinal
            descricao="Média diária dos treinos contabilizados"
            icone={Dumbbell}
            rotulo="Gasto por treino"
            total={total}
            valor={energia.gmt}
          />
          <Linha
            comSinal
            descricao="Derivado da meta de peso e do prazo"
            icone={Target}
            negativo={energia.ajuste < 0}
            rotulo="Ajuste do objetivo"
            total={total}
            valor={energia.ajuste}
          />
        </ul>
      </Card.Content>

      <Card.Footer className="flex-col items-stretch gap-4">
        <Separator />
        <div className="flex items-baseline justify-between">
          <p className="text-foreground text-sm font-semibold">VET final</p>
          <p className="text-foreground text-xl font-semibold tabular-nums">
            {kcalFmt(energia.vet)} <span className="text-muted text-xs font-normal">kcal/dia</span>
          </p>
        </div>
      </Card.Footer>
    </Card>
  );
}
