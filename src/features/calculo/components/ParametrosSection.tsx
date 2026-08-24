import {
  Card,
  Chip,
  Label,
  ListBox,
  NumberField,
  Select,
  Slider,
  Switch,
} from "@heroui/react";
import { Sparkles } from "lucide-react";

import type { CalculoDerivado, CalculoInputs } from "../useCalculoState";
import { PACIENTE_DEMO } from "../useCalculoState";
import type { FormulaTMB } from "../motor";
import { FORMULAS, g1Fmt, kcalFmt, niveisAtividade } from "../motor";

/*
 * Parâmetros do cálculo — tudo reativo: qualquer alteração recalcula o hero.
 * Idade e sexo não são editáveis de propósito: no produto vêm do cadastro do
 * paciente (Patient.birthDate/gender), sem input na tela de cálculo.
 */

interface ParametrosSectionProps {
  inputs: CalculoInputs;
  derivado: CalculoDerivado;
  formulaEfetiva: FormulaTMB;
  patch: <K extends keyof CalculoInputs>(key: K, value: CalculoInputs[K]) => void;
  toggleTreino: (id: string) => void;
}

export function ParametrosSection({
  inputs,
  derivado,
  formulaEfetiva,
  patch,
  toggleTreino,
}: ParametrosSectionProps) {
  const niveis = niveisAtividade(formulaEfetiva, PACIENTE_DEMO.sexo);
  const deficit = derivado.ajuste < 0;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-foreground text-base font-semibold">Parâmetros do cálculo</h2>
        <p className="text-muted mt-0.5 text-sm">
          Toda alteração recalcula o resultado imediatamente
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {/* ---------------------------------------------------------- */}
        <Card className="flex flex-col gap-5 rounded-2xl p-6">
          <div>
            <h3 className="text-foreground text-lg font-medium">Paciente</h3>
            <p className="text-muted mt-0.5 text-sm">
              {PACIENTE_DEMO.idade} anos · {PACIENTE_DEMO.sexo === "F" ? "Feminino" : "Masculino"} ·
              do cadastro
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              fullWidth
              minValue={20}
              maxValue={300}
              onChange={(v) => Number.isFinite(v) && patch("peso", v)}
              step={0.1}
              value={inputs.peso}
            >
              <Label>Peso (kg)</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
            <NumberField
              fullWidth
              minValue={100}
              maxValue={230}
              onChange={(v) => Number.isFinite(v) && patch("altura", v)}
              step={1}
              value={inputs.altura}
            >
              <Label>Altura (cm)</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
          </div>

          <NumberField
            fullWidth
            minValue={0}
            maxValue={70}
            onChange={(v) => patch("percentualGordura", Number.isFinite(v) ? v : null)}
            step={0.5}
            value={inputs.percentualGordura ?? Number.NaN}
          >
            <Label>Percentual de gordura (%)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <div className="bg-surface-secondary border-border mt-auto rounded-xl border p-3.5">
            <div className="flex items-baseline justify-between">
              <p className="text-muted text-xs">Massa magra derivada</p>
              <p className="text-foreground text-sm font-semibold tabular-nums">
                {derivado.massaMagra > 0 ? `${g1Fmt(derivado.massaMagra)} kg` : "—"}
              </p>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <p className="text-muted text-xs">IMC</p>
              <p className="text-foreground text-sm font-semibold tabular-nums">
                {g1Fmt(derivado.imc)} kg/m²
              </p>
            </div>
          </div>
        </Card>

        {/* ---------------------------------------------------------- */}
        <Card className="flex flex-col gap-5 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-foreground text-lg font-medium">Gasto energético</h3>
              <p className="text-muted mt-0.5 text-sm">Fórmula, atividade e treinos</p>
            </div>
            <Switch
              isSelected={inputs.inteligente}
              onChange={(selecionado) => patch("inteligente", selecionado)}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span className="text-foreground flex items-center gap-1 text-xs font-medium">
                <Sparkles aria-hidden className="text-accent size-3.5" />
                Inteligente
              </span>
            </Switch>
          </div>

          {inputs.inteligente && derivado.sugestao && (
            <p className="bg-accent-soft text-accent-soft-foreground rounded-lg px-3 py-2 text-xs leading-relaxed">
              {derivado.sugestao.motivo}
            </p>
          )}

          <Select
            isDisabled={inputs.inteligente}
            onSelectionChange={(key) => patch("formula", String(key) as FormulaTMB)}
            selectedKey={formulaEfetiva}
          >
            <Label>Fórmula de gasto energético</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {(Object.keys(FORMULAS) as FormulaTMB[]).map((id) => (
                  <ListBox.Item id={id} key={id} textValue={FORMULAS[id].nome}>
                    {FORMULAS[id].nome}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            onSelectionChange={(key) => patch("nivelAtividade", String(key))}
            selectedKey={
              niveis.some((n) => n.chave === inputs.nivelAtividade)
                ? inputs.nivelAtividade
                : niveis[0].chave
            }
          >
            <Label>Fator de atividade física</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {niveis.map((nivel) => (
                  <ListBox.Item
                    id={nivel.chave}
                    key={nivel.chave}
                    textValue={`${nivel.chave} (${nivel.fator})`}
                  >
                    {nivel.chave} ({nivel.fator})
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {derivado.faltantes.length > 0 && (
            <Chip color="warning" size="sm" variant="soft">
              Faltando: {derivado.faltantes.join(", ")}
            </Chip>
          )}

          <ul className="border-border mt-auto flex flex-col gap-3 border-t pt-4">
            {derivado.treinosResolvidos.map((treino) => (
              <li className="flex items-center justify-between gap-3" key={treino.id}>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${treino.contabilizado ? "text-foreground" : "text-muted line-through"}`}
                  >
                    {treino.nome}
                  </p>
                  <p className="text-muted text-xs tabular-nums">
                    {treino.frequenciaSemanal}x/sem · {treino.duracaoMin} min · +
                    {kcalFmt(treino.kcalSemanal)} kcal/sem
                  </p>
                </div>
                <Switch
                  aria-label={`Contabilizar ${treino.nome}`}
                  isSelected={treino.contabilizado}
                  onChange={() => toggleTreino(treino.id)}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              </li>
            ))}
          </ul>
        </Card>

        {/* ---------------------------------------------------------- */}
        <Card className="flex flex-col gap-6 rounded-2xl p-6">
          <div>
            <h3 className="text-foreground text-lg font-medium">Objetivo</h3>
            <p className="text-muted mt-0.5 text-sm">Meta de peso e prazo definem o ajuste</p>
          </div>

          <Slider
            maxValue={20}
            minValue={-20}
            onChange={(v) => patch("metaPeso", Array.isArray(v) ? v[0] : v)}
            step={0.5}
            value={inputs.metaPeso}
          >
            <div className="flex items-center justify-between">
              <Label>Meta de peso</Label>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  inputs.metaPeso < 0
                    ? "text-danger"
                    : inputs.metaPeso > 0
                      ? "text-success"
                      : "text-muted"
                }`}
              >
                {inputs.metaPeso > 0 ? "+" : ""}
                {g1Fmt(inputs.metaPeso)} kg
              </span>
            </div>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>

          <Slider
            maxValue={52}
            minValue={1}
            onChange={(v) => patch("tempoSemanas", Array.isArray(v) ? v[0] : v)}
            step={1}
            value={inputs.tempoSemanas}
          >
            <div className="flex items-center justify-between">
              <Label>Prazo estimado</Label>
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {inputs.tempoSemanas} semanas
              </span>
            </div>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>

          <div className="bg-accent-soft mt-auto rounded-xl p-4">
            <p className="text-accent-soft-foreground text-sm leading-relaxed">
              {derivado.ajuste === 0 ? (
                <>Sem meta de variação: o VET permanece igual ao gasto total.</>
              ) : (
                <>
                  Para {inputs.metaPeso < 0 ? "perder" : "ganhar"}{" "}
                  <strong>{g1Fmt(Math.abs(inputs.metaPeso))} kg</strong> em{" "}
                  <strong>{inputs.tempoSemanas} semanas</strong>:{" "}
                  {deficit ? "déficit" : "superávit"} de{" "}
                  <strong>{kcalFmt(Math.abs(derivado.ajuste))} kcal/dia</strong>.
                </>
              )}
            </p>
            <p className="text-accent-soft-foreground/70 mt-1.5 text-xs">
              Equivalência usada pelo motor: 1 kg ≈ 7.700 kcal.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
