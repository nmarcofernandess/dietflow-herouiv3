/*
 * Motor de cálculo nutricional — porte fiel da engine do DietFlow
 * (src/components/clinical/calculo/utils/modulocalculo.ts + gerarCenarios.ts
 * + vetDiario.ts + AjusteObjetivo/utils.ts), reduzido ao que o demo consome.
 *
 * Regras preservadas do produto real:
 * - GMT vem dos treinos (Σ kcal semanal contabilizada ÷ 7), não da fórmula
 *   MET×TMB/24 (que é código morto no fluxo real).
 * - Threshold de cenário significativo: gmtDia > TMB × 0.1.
 * - Ajuste calórico: (metaPeso × 7700) ÷ tempoDias.
 * - Protocolo de macros: vizinho mais próximo por kcal/kg (VET ÷ peso).
 */

export type Sexo = "M" | "F";

export type FormulaTMB =
  | "harris-benedict"
  | "harris-benedict-revisada"
  | "who"
  | "mifflin"
  | "katch-mcardle"
  | "cunningham"
  | "owen"
  | "schofield"
  | "tinsley-basica"
  | "tinsley-avancada";

export interface DadosTMB {
  peso: number;
  altura: number; // cm
  idade: number;
  sexo: Sexo;
  massaMagra: number; // kg — derivada de peso + %gordura
  massaGorda: number; // kg — peso − massaMagra
}

type CampoTMB = "peso" | "altura" | "idade" | "sexo" | "massa_magra" | "massa_gorda";

interface ConfigFormula {
  nome: string;
  indicacao: string;
  requer: CampoTMB[];
  calc: (d: DadosTMB) => number;
}

const faixaWHO = (idade: number) => (idade <= 30 ? "18-30" : idade <= 60 ? "31-60" : "60+");
const faixaSchofield = (idade: number) =>
  idade <= 18 ? "0-18" : idade <= 30 ? "18-30" : idade <= 60 ? "31-60" : "60+";

export const FORMULAS: Record<FormulaTMB, ConfigFormula> = {
  "harris-benedict": {
    nome: "Harris-Benedict (1919)",
    indicacao: "Clássica; tende a superestimar em populações modernas",
    requer: ["peso", "altura", "idade", "sexo"],
    calc: (d) =>
      d.sexo === "M"
        ? 66.47 + 13.75 * d.peso + 5.003 * d.altura - 6.755 * d.idade
        : 655.1 + 9.563 * d.peso + 1.85 * d.altura - 4.676 * d.idade,
  },
  "harris-benedict-revisada": {
    nome: "Harris-Benedict revisada (1984)",
    indicacao: "Versão de Roza & Shizgal; boa para adultos em geral",
    requer: ["peso", "altura", "idade", "sexo"],
    calc: (d) =>
      d.sexo === "M"
        ? 88.362 + 13.397 * d.peso + 4.799 * d.altura - 5.677 * d.idade
        : 447.593 + 9.247 * d.peso + 3.098 * d.altura - 4.33 * d.idade,
  },
  who: {
    nome: "FAO/OMS (1985)",
    indicacao: "Padrão institucional; usa apenas peso e faixa etária",
    requer: ["peso", "idade", "sexo"],
    calc: (d) => {
      const f = faixaWHO(d.idade);
      if (d.sexo === "M") {
        if (f === "18-30") return 15.057 * d.peso + 692.2;
        if (f === "31-60") return 11.472 * d.peso + 873.1;
        return 11.711 * d.peso + 587.7;
      }
      if (f === "18-30") return 14.818 * d.peso + 486.6;
      if (f === "31-60") return 8.126 * d.peso + 845.6;
      return 9.082 * d.peso + 658.5;
    },
  },
  mifflin: {
    nome: "Mifflin-St Jeor (1990)",
    indicacao: "Melhor validação para a população geral adulta",
    requer: ["peso", "altura", "idade", "sexo"],
    calc: (d) =>
      d.sexo === "M"
        ? 10 * d.peso + 6.25 * d.altura - 5 * d.idade + 5
        : 10 * d.peso + 6.25 * d.altura - 5 * d.idade - 161,
  },
  "katch-mcardle": {
    nome: "Katch-McArdle",
    indicacao: "Baseada em massa magra; indicada com composição corporal aferida",
    requer: ["massa_magra"],
    calc: (d) => 370 + 21.6 * d.massaMagra,
  },
  cunningham: {
    nome: "Cunningham (1980)",
    indicacao: "Massa magra; frequente em contexto esportivo",
    requer: ["massa_magra"],
    calc: (d) => 500 + 22 * d.massaMagra,
  },
  owen: {
    nome: "Owen (1986-87)",
    indicacao: "Somente peso; útil com dados mínimos",
    requer: ["peso", "sexo"],
    calc: (d) => (d.sexo === "M" ? 879 + 10.2 * d.peso : 795 + 7.18 * d.peso),
  },
  schofield: {
    nome: "Schofield (1985)",
    indicacao: "Faixas etárias amplas; cobre crianças e adolescentes",
    requer: ["peso", "altura", "idade", "sexo"],
    calc: (d) => {
      const f = faixaSchofield(d.idade);
      if (d.sexo === "M") {
        if (f === "0-18") return 16.25 * d.peso + 1.372 * d.altura + 515.5;
        if (f === "18-30") return 14.4 * d.peso + 3.13 * d.altura + 113.5;
        if (f === "31-60") return 11.4 * d.peso + 5.41 * d.altura - 137.9;
        return 11.4 * d.peso + 4.32 * d.altura - 78.9;
      }
      if (f === "0-18") return 8.365 * d.peso + 4.65 * d.altura + 200;
      if (f === "18-30") return 13.3 * d.peso + 3.34 * d.altura + 35;
      if (f === "31-60") return 8.07 * d.peso + 2.75 * d.altura + 145.9;
      return 9.08 * d.peso + 1.84 * d.altura + 307.9;
    },
  },
  "tinsley-basica": {
    nome: "Tinsley básica (2017)",
    indicacao: "Atletas de força; massa magra",
    requer: ["massa_magra"],
    calc: (d) => 25.9 * d.massaMagra + 284,
  },
  "tinsley-avancada": {
    nome: "Tinsley avançada (2017)",
    indicacao: "Atletas com composição corporal completa",
    requer: ["massa_magra", "massa_gorda", "idade"],
    calc: (d) => 24.8 * d.massaMagra + 9.6 * d.massaGorda - 4.2 * d.idade + 706,
  },
};

/* Cada fórmula tem sua própria tabela de fator atividade (como no produto). */
export interface NivelAtividade {
  chave: string;
  fator: number;
}

const FAF_PADRAO: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.2 },
  { chave: "Levemente Ativo", fator: 1.375 },
  { chave: "Moderadamente Ativo", fator: 1.55 },
  { chave: "Muito Ativo", fator: 1.725 },
  { chave: "Extremamente Ativo", fator: 1.9 },
];

const FAF_MIFFLIN: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.2 },
  { chave: "Pouco Ativo", fator: 1.3 },
  { chave: "Moderadamente Ativo", fator: 1.5 },
  { chave: "Muito Ativo", fator: 1.7 },
  { chave: "Extra Ativo", fator: 1.9 },
];

const FAF_MASSA_MAGRA: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.2 },
  { chave: "Exercício Leve", fator: 1.375 },
  { chave: "Exercício Moderado", fator: 1.55 },
  { chave: "Exercício Intenso", fator: 1.725 },
  { chave: "Exercício Muito Intenso", fator: 2.0 },
];

const FAF_TINSLEY: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.2 },
  { chave: "Treino 3-4x/semana", fator: 1.5 },
  { chave: "Treino 4-6x/semana", fator: 1.8 },
  { chave: "Treino 6x/semana + Cardio", fator: 2.0 },
];

const FAF_WHO_M: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.53 },
  { chave: "Moderado", fator: 1.76 },
  { chave: "Intenso", fator: 2.25 },
];

const FAF_WHO_F: NivelAtividade[] = [
  { chave: "Sedentário", fator: 1.56 },
  { chave: "Moderado", fator: 1.64 },
  { chave: "Intenso", fator: 1.82 },
];

export function niveisAtividade(formula: FormulaTMB, sexo: Sexo): NivelAtividade[] {
  switch (formula) {
    case "mifflin":
      return FAF_MIFFLIN;
    case "who":
      return sexo === "M" ? FAF_WHO_M : FAF_WHO_F;
    case "katch-mcardle":
    case "cunningham":
      return FAF_MASSA_MAGRA;
    case "schofield":
      return FAF_PADRAO.slice(0, 4);
    case "tinsley-basica":
    case "tinsley-avancada":
      return FAF_TINSLEY;
    default:
      return FAF_PADRAO;
  }
}

export function getFator(formula: FormulaTMB, nivel: string, sexo: Sexo): number {
  const tabela = niveisAtividade(formula, sexo);
  return tabela.find((n) => n.chave === nivel)?.fator ?? tabela[0]?.fator ?? 1.2;
}

export function camposFaltantes(dados: DadosTMB, formula: FormulaTMB): string[] {
  const rotulo: Record<CampoTMB, string> = {
    peso: "Peso",
    altura: "Altura",
    idade: "Idade",
    sexo: "Sexo",
    massa_magra: "Massa magra",
    massa_gorda: "Massa gorda",
  };
  return FORMULAS[formula].requer
    .filter((campo) => {
      if (campo === "massa_magra") return !dados.massaMagra;
      if (campo === "massa_gorda") return !dados.massaGorda;
      if (campo === "sexo") return !dados.sexo;
      return !dados[campo];
    })
    .map((campo) => rotulo[campo]);
}

export const calcularTMB = (dados: DadosTMB, formula: FormulaTMB): number =>
  FORMULAS[formula].calc(dados);

/* ------------------------------------------------------------------ */
/* Treinos (MET)                                                       */
/* ------------------------------------------------------------------ */

export const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

/* Compendium of Physical Activities — subconjunto do catálogo do produto. */
export const CATALOGO_EXERCICIOS = [
  { id: "musculacao", nome: "Musculação", met: 4.5 },
  { id: "caminhada", nome: "Caminhada rápida", met: 3.8 },
  { id: "corrida", nome: "Corrida", met: 8.3 },
  { id: "ciclismo", nome: "Ciclismo", met: 8.0 },
  { id: "natacao", nome: "Natação", met: 6.0 },
  { id: "yoga", nome: "Yoga", met: 2.5 },
] as const;

export interface Treino {
  id: string;
  exercicioId: (typeof CATALOGO_EXERCICIOS)[number]["id"];
  duracaoMin: number;
  frequenciaSemanal: number; // 1..7
  horario: string; // "HH:MM"
  contabilizado: boolean;
}

/* kcal = MET × peso × (min ÷ 60) — triangulacaoMET.ts */
export const kcalPorSessao = (met: number, duracaoMin: number, peso: number): number =>
  met * peso * (duracaoMin / 60);

/* Distribuição fixa de dias por frequência (gerarCenarios.ts). */
export function diasPorFrequencia(freq: number): DiaSemana[] {
  const mapa: Record<number, DiaSemana[]> = {
    1: ["SEG"],
    2: ["SEG", "QUA"],
    3: ["SEG", "QUA", "SEX"],
    4: ["SEG", "TER", "QUA", "QUI"],
    5: ["SEG", "TER", "QUA", "QUI", "SEX"],
    6: ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"],
  };
  return freq >= 7 ? [...DIAS_SEMANA] : (mapa[freq] ?? ["SEG"]);
}

export interface TreinoResolvido extends Treino {
  nome: string;
  met: number;
  kcalSessao: number;
  kcalSemanal: number;
  dias: DiaSemana[];
}

export function resolverTreinos(treinos: Treino[], peso: number): TreinoResolvido[] {
  return treinos.map((t) => {
    const ex = CATALOGO_EXERCICIOS.find((e) => e.id === t.exercicioId) ?? CATALOGO_EXERCICIOS[0];
    const kcal = kcalPorSessao(ex.met, t.duracaoMin, peso);
    return {
      ...t,
      nome: ex.nome,
      met: ex.met,
      kcalSessao: kcal,
      kcalSemanal: kcal * t.frequenciaSemanal,
      dias: diasPorFrequencia(t.frequenciaSemanal),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Energia: GEA / GMT / GET / VET                                      */
/* ------------------------------------------------------------------ */

export interface ResultadoEnergia {
  tmb: number;
  gea: number;
  gmt: number;
  gmtSemanal: number;
  get: number;
  ajuste: number;
  vet: number;
  vetKg: number;
}

export function calcularEnergia(
  dados: DadosTMB,
  formula: FormulaTMB,
  nivelAtividade: string,
  treinos: TreinoResolvido[],
  ajuste: number,
): ResultadoEnergia {
  const tmb = calcularTMB(dados, formula);
  const fator = getFator(formula, nivelAtividade, dados.sexo);
  const gea = tmb * (fator - 1);
  const gmtSemanal = treinos
    .filter((t) => t.contabilizado)
    .reduce((soma, t) => soma + t.kcalSemanal, 0);
  const gmt = gmtSemanal / 7;
  const get = tmb + gea + gmt;
  const vet = Math.round(get + ajuste);
  const vetKg = dados.peso ? Math.round((vet / dados.peso) * 100) / 100 : 0;
  return { tmb, gea, gmt, gmtSemanal, get, ajuste, vet, vetKg };
}

/* Objetivo → ajuste diário: 1 kg ≈ 7700 kcal (AjusteObjetivo/utils.ts). */
export const KCAL_POR_KG = 7700;

export const ajusteCaloricoDiario = (metaPesoKg: number, tempoDias: number): number =>
  tempoDias > 0 && metaPesoKg !== 0 ? Math.round((metaPesoKg * KCAL_POR_KG) / tempoDias) : 0;

/* ------------------------------------------------------------------ */
/* VET por dia da semana (vetDiario.ts)                                */
/* ------------------------------------------------------------------ */

export interface VetDia {
  dia: DiaSemana;
  base: number;
  treino: number;
  ajuste: number;
  total: number;
}

export function calcularVetDiario(
  tmb: number,
  gea: number,
  ajuste: number,
  treinos: TreinoResolvido[],
): VetDia[] {
  return DIAS_SEMANA.map((dia) => {
    const gmtDia = treinos
      .filter((t) => t.contabilizado && t.dias.includes(dia))
      .reduce((soma, t) => soma + t.kcalSessao, 0);
    return {
      dia,
      base: tmb + gea,
      treino: gmtDia,
      ajuste,
      total: tmb + gea + gmtDia + ajuste,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Cenários (gerarCenarios.ts — os 3 modos reais)                      */
/* ------------------------------------------------------------------ */

export type ModoCenarios = "basico" | "otimizado" | "sistematico";

export interface Cenario {
  nome: string;
  dias: DiaSemana[];
  vet: number;
  gmt: number;
  comTreino: boolean;
  periodo?: string;
}

function periodoDoHorario(horario: string): string {
  const hora = Number(horario.split(":")[0] ?? 0);
  if (hora >= 5 && hora < 12) return "Manhã";
  if (hora >= 12 && hora < 18) return "Tarde";
  if (hora >= 18 && hora < 22) return "Noite";
  return "Madrugada";
}

export function gerarCenarios(
  modo: ModoCenarios,
  tmb: number,
  gea: number,
  ajuste: number,
  treinos: TreinoResolvido[],
): Cenario[] {
  const base = tmb + gea;
  const ativos = treinos.filter((t) => t.contabilizado);
  const vetDiario = calcularVetDiario(tmb, gea, ajuste, treinos);
  const limiar = tmb * 0.1; // threshold real: dia significativo se gmtDia > 10% da TMB

  if (modo === "basico") {
    const gmtMedio = ativos.reduce((s, t) => s + t.kcalSemanal, 0) / 7;
    return [
      {
        nome: "Todos os dias",
        dias: [...DIAS_SEMANA],
        vet: Math.round(base + gmtMedio + ajuste),
        gmt: gmtMedio,
        comTreino: ativos.length > 0,
      },
    ];
  }

  if (modo === "otimizado") {
    const diasTreino = vetDiario.filter((d) => d.treino > limiar);
    const diasDescanso = vetDiario.filter((d) => d.treino <= limiar);
    if (diasTreino.length === 0) {
      return [
        {
          nome: "Todos os dias",
          dias: [...DIAS_SEMANA],
          vet: Math.round(base + ajuste),
          gmt: 0,
          comTreino: false,
        },
      ];
    }
    const gmtMedio = diasTreino.reduce((s, d) => s + d.treino, 0) / diasTreino.length;
    const cenarios: Cenario[] = [
      {
        nome: "Dias com treino",
        dias: diasTreino.map((d) => d.dia),
        vet: Math.round(base + gmtMedio + ajuste),
        gmt: gmtMedio,
        comTreino: true,
      },
    ];
    if (diasDescanso.length > 0) {
      cenarios.push({
        nome: "Dias sem treino",
        dias: diasDescanso.map((d) => d.dia),
        vet: Math.round(base + ajuste),
        gmt: 0,
        comTreino: false,
      });
    }
    return cenarios;
  }

  /* sistemático: um cenário por período de treino + dias sem treino.
     Dia com treinos em dois períodos entra em dois cenários (regra real). */
  const porPeriodo = new Map<string, { dias: Set<DiaSemana>; gmtTotal: number; n: number }>();
  for (const treino of ativos) {
    if (treino.kcalSessao <= limiar) continue;
    const periodo = periodoDoHorario(treino.horario);
    const grupo = porPeriodo.get(periodo) ?? { dias: new Set<DiaSemana>(), gmtTotal: 0, n: 0 };
    for (const dia of treino.dias) {
      grupo.dias.add(dia);
      grupo.gmtTotal += treino.kcalSessao;
      grupo.n += 1;
    }
    porPeriodo.set(periodo, grupo);
  }
  const diasComTreino = new Set(
    vetDiario.filter((d) => d.treino > limiar).map((d) => d.dia),
  );
  const cenarios: Cenario[] = [...porPeriodo.entries()].map(([periodo, grupo], i) => {
    const dias = [...grupo.dias];
    // VET do grupo usa o gasto TOTAL de cada dia (regra real), média entre os dias
    const vetMedio =
      dias.reduce((s, dia) => s + (vetDiario.find((d) => d.dia === dia)?.total ?? 0), 0) /
      dias.length;
    return {
      nome: `Cenário ${i + 1} — ${periodo}`,
      dias,
      vet: Math.round(vetMedio),
      gmt: grupo.n > 0 ? grupo.gmtTotal / grupo.n : 0,
      comTreino: true,
      periodo,
    };
  });
  const semTreino = DIAS_SEMANA.filter((d) => !diasComTreino.has(d));
  if (semTreino.length > 0) {
    cenarios.push({
      nome: "Sem treino",
      dias: semTreino,
      vet: Math.round(base + ajuste),
      gmt: 0,
      comTreino: false,
    });
  }
  return cenarios.length > 0
    ? cenarios
    : [
        {
          nome: "Todos os dias",
          dias: [...DIAS_SEMANA],
          vet: Math.round(base + ajuste),
          gmt: 0,
          comTreino: false,
        },
      ];
}

/* ------------------------------------------------------------------ */
/* Macros — protocolos por densidade energética (constants/calculo.ts) */
/* ------------------------------------------------------------------ */

export interface Protocolo {
  kcalKg: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

export const PROTOCOLOS: Record<string, Protocolo> = {
  "Bulking 3": { kcalKg: 60, carboidratos: 0.6, proteinas: 0.2, gorduras: 0.2 },
  "Bulking 2": { kcalKg: 45, carboidratos: 0.55, proteinas: 0.2, gorduras: 0.25 },
  "Bulking 1": { kcalKg: 40, carboidratos: 0.5, proteinas: 0.25, gorduras: 0.25 },
  "Hipertrofia 2": { kcalKg: 35, carboidratos: 0.45, proteinas: 0.3, gorduras: 0.25 },
  "Hipertrofia 1": { kcalKg: 30, carboidratos: 0.45, proteinas: 0.3, gorduras: 0.25 },
  Normocalórica: { kcalKg: 27, carboidratos: 0.4, proteinas: 0.35, gorduras: 0.25 },
  "Body Recomp": { kcalKg: 25, carboidratos: 0.4, proteinas: 0.4, gorduras: 0.2 },
  "Cutting 1": { kcalKg: 20, carboidratos: 0.3, proteinas: 0.45, gorduras: 0.25 },
  "Cutting 2": { kcalKg: 18, carboidratos: 0.3, proteinas: 0.45, gorduras: 0.25 },
  "Cutting 3": { kcalKg: 16, carboidratos: 0.2, proteinas: 0.5, gorduras: 0.3 },
};

export interface Macros {
  protocoloNome: string;
  protocolo: Protocolo;
  proteinasG: number;
  carboidratosG: number;
  gordurasG: number;
  proteinasKcal: number;
  carboidratosKcal: number;
  gordurasKcal: number;
  proteinasGkg: number;
  carboidratosGkg: number;
  gordurasGkg: number;
}

export function calcularMacros(vet: number, peso: number): Macros {
  const vetKg = peso > 0 ? vet / peso : 30;
  let protocoloNome = "Normocalórica";
  let menorDiff = Number.MAX_VALUE;
  for (const [nome, p] of Object.entries(PROTOCOLOS)) {
    const diff = Math.abs(p.kcalKg - vetKg);
    if (diff < menorDiff) {
      menorDiff = diff;
      protocoloNome = nome;
    }
  }
  const protocolo = PROTOCOLOS[protocoloNome];
  const carboidratosKcal = vet * protocolo.carboidratos;
  const proteinasKcal = vet * protocolo.proteinas;
  const gordurasKcal = vet * protocolo.gorduras;
  const carboidratosG = carboidratosKcal / 4;
  const proteinasG = proteinasKcal / 4;
  const gordurasG = gordurasKcal / 9;
  return {
    protocoloNome,
    protocolo,
    proteinasG,
    carboidratosG,
    gordurasG,
    proteinasKcal,
    carboidratosKcal,
    gordurasKcal,
    proteinasGkg: peso ? proteinasG / peso : 0,
    carboidratosGkg: peso ? carboidratosG / peso : 0,
    gordurasGkg: peso ? gordurasG / peso : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Escolha inteligente de fórmula (modulocalculo.ts:448+)              */
/* ------------------------------------------------------------------ */

export interface EscolhaInteligente {
  formula: FormulaTMB;
  motivo: string;
}

export function escolherFormulaInteligente(
  dados: DadosTMB,
  percentualGordura: number | null,
): EscolhaInteligente | null {
  const { peso, altura, idade, sexo, massaMagra } = dados;
  if (!peso) return null;
  const imc = altura > 0 ? peso / (altura / 100) ** 2 : null;
  const obeso = imc != null && imc >= 30;
  const menor18 = idade > 0 && idade < 18;
  const idoso = idade >= 60;
  const atleta =
    massaMagra > 0 &&
    percentualGordura != null &&
    ((sexo === "M" && percentualGordura < 15) || (sexo === "F" && percentualGordura < 22));

  const viavel = (f: FormulaTMB) => camposFaltantes(dados, f).length === 0;
  const primeira = (lista: FormulaTMB[]) => lista.find(viavel) ?? null;

  if (menor18) {
    const f = primeira(["schofield", "who", "mifflin"]);
    return f ? { formula: f, motivo: "Menor de 18 anos: Schofield cobre faixas etárias jovens" } : null;
  }
  if (atleta || (massaMagra > 0 && obeso)) {
    const f = primeira(["tinsley-avancada", "tinsley-basica", "cunningham", "katch-mcardle"]);
    if (f)
      return {
        formula: f,
        motivo: atleta
          ? "Percentual de gordura baixo com massa magra aferida: fórmulas de massa magra são mais precisas"
          : "IMC ≥ 30 com massa magra aferida: fórmulas de massa magra evitam superestimar",
      };
  }
  if (obeso) {
    const f = primeira(["mifflin", "harris-benedict-revisada", "who"]);
    return f ? { formula: f, motivo: "IMC ≥ 30: Mifflin-St Jeor minimiza a superestimação" } : null;
  }
  if (idoso) {
    const f = primeira(["who", "schofield", "mifflin"]);
    return f ? { formula: f, motivo: "60 anos ou mais: FAO/OMS tem melhor validação nessa faixa" } : null;
  }
  const f = primeira(["mifflin", "harris-benedict-revisada", "who", "schofield"]);
  return f
    ? { formula: f, motivo: "Adulto na faixa geral: Mifflin-St Jeor é a mais bem validada" }
    : null;
}

/* ------------------------------------------------------------------ */
/* Composição corporal (composicaoCorporal.ts)                         */
/* ------------------------------------------------------------------ */

export const massaMagraDe = (peso: number, percentualGordura: number): number =>
  (peso * (100 - percentualGordura)) / 100;

/* ------------------------------------------------------------------ */
/* Formatação (calculo-display.ts: kcal nunca com vírgula)             */
/* ------------------------------------------------------------------ */

export const kcalFmt = (n: number): string => Math.round(n).toLocaleString("pt-BR");
export const g1Fmt = (n: number): string =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
