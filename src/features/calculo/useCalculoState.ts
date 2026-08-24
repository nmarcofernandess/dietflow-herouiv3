import { useMemo, useState } from "react";

import {
  ajusteCaloricoDiario,
  calcularEnergia,
  calcularMacros,
  calcularVetDiario,
  camposFaltantes,
  escolherFormulaInteligente,
  gerarCenarios,
  massaMagraDe,
  resolverTreinos,
  type Cenario,
  type DadosTMB,
  type EscolhaInteligente,
  type FormulaTMB,
  type Macros,
  type ModoCenarios,
  type ResultadoEnergia,
  type Sexo,
  type Treino,
  type TreinoResolvido,
  type VetDia,
} from "./motor";

/*
 * Paciente demo: Ana Beatriz Nogueira (a mesma da página de Gestão de
 * Pacientes). No produto real idade e sexo não têm input — vêm de
 * Patient.birthDate/gender; o demo preserva essa regra.
 */
export const PACIENTE_DEMO = {
  nome: "Ana Beatriz Nogueira",
  idade: 33,
  sexo: "F" as Sexo,
  objetivoTag: "Emagrecimento",
  antropometriaData: "12/08/2026",
};

export interface CalculoInputs {
  peso: number;
  altura: number;
  percentualGordura: number | null;
  formula: FormulaTMB;
  inteligente: boolean;
  nivelAtividade: string;
  treinos: Treino[];
  metaPeso: number; // kg (negativo = perder)
  tempoSemanas: number;
  modoCenarios: ModoCenarios;
}

const INPUTS_INICIAIS: CalculoInputs = {
  peso: 78.4,
  altura: 165,
  percentualGordura: 31,
  formula: "mifflin",
  inteligente: true,
  nivelAtividade: "Pouco Ativo",
  treinos: [
    {
      id: "treino-1",
      exercicioId: "musculacao",
      duracaoMin: 60,
      frequenciaSemanal: 3,
      horario: "07:00",
      contabilizado: true,
    },
    {
      id: "treino-2",
      exercicioId: "caminhada",
      duracaoMin: 40,
      frequenciaSemanal: 2,
      horario: "18:30",
      contabilizado: true,
    },
  ],
  metaPeso: -5,
  tempoSemanas: 12,
  modoCenarios: "otimizado",
};

export interface CalculoDerivado {
  dados: DadosTMB;
  massaMagra: number;
  energia: ResultadoEnergia;
  macros: Macros;
  vetDiario: VetDia[];
  cenarios: Cenario[];
  treinosResolvidos: TreinoResolvido[];
  sugestao: EscolhaInteligente | null;
  faltantes: string[];
  ajuste: number;
  tempoDias: number;
  imc: number;
}

export function useCalculoState() {
  const [inputs, setInputs] = useState<CalculoInputs>(INPUTS_INICIAIS);

  const patch = <K extends keyof CalculoInputs>(key: K, value: CalculoInputs[K]) =>
    setInputs((atual) => ({ ...atual, [key]: value }));

  const toggleTreino = (id: string) =>
    setInputs((atual) => ({
      ...atual,
      treinos: atual.treinos.map((t) =>
        t.id === id ? { ...t, contabilizado: !t.contabilizado } : t,
      ),
    }));

  const derivado: CalculoDerivado = useMemo(() => {
    const massaMagra =
      inputs.percentualGordura != null ? massaMagraDe(inputs.peso, inputs.percentualGordura) : 0;
    const dados: DadosTMB = {
      peso: inputs.peso,
      altura: inputs.altura,
      idade: PACIENTE_DEMO.idade,
      sexo: PACIENTE_DEMO.sexo,
      massaMagra,
      massaGorda: massaMagra > 0 ? inputs.peso - massaMagra : 0,
    };

    const sugestao = escolherFormulaInteligente(dados, inputs.percentualGordura);
    const formula = inputs.inteligente && sugestao ? sugestao.formula : inputs.formula;
    const faltantes = camposFaltantes(dados, formula);

    const tempoDias = inputs.tempoSemanas * 7;
    const ajuste = ajusteCaloricoDiario(inputs.metaPeso, tempoDias);
    const treinosResolvidos = resolverTreinos(inputs.treinos, inputs.peso);

    const energia = calcularEnergia(dados, formula, inputs.nivelAtividade, treinosResolvidos, ajuste);
    const macros = calcularMacros(energia.vet, inputs.peso);
    const vetDiario = calcularVetDiario(energia.tmb, energia.gea, ajuste, treinosResolvidos);
    const cenarios = gerarCenarios(
      inputs.modoCenarios,
      energia.tmb,
      energia.gea,
      ajuste,
      treinosResolvidos,
    );
    const imc = inputs.altura > 0 ? inputs.peso / (inputs.altura / 100) ** 2 : 0;

    return {
      dados,
      massaMagra,
      energia,
      macros,
      vetDiario,
      cenarios,
      treinosResolvidos,
      sugestao,
      faltantes,
      ajuste,
      tempoDias,
      imc,
    };
  }, [inputs]);

  const formulaEfetiva =
    inputs.inteligente && derivado.sugestao ? derivado.sugestao.formula : inputs.formula;

  return { inputs, patch, toggleTreino, derivado, formulaEfetiva };
}
