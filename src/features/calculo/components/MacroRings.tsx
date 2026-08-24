import type { Macros } from "../motor";
import { g1Fmt, kcalFmt } from "../motor";

/*
 * Anéis concêntricos de distribuição de macros — cada anel é a fração do VET
 * de um macro, na mesma matiz do accent com três intensidades (evita
 * arco-íris e mantém a marca em qualquer tema, como os rings da referência).
 */

const ANEIS = [
  { chave: "proteinas", rotulo: "Proteínas", raio: 80, opacidade: 1 },
  { chave: "carboidratos", rotulo: "Carboidratos", raio: 62, opacidade: 0.62 },
  { chave: "gorduras", rotulo: "Gorduras", raio: 44, opacidade: 0.38 },
] as const;

interface MacroRingsProps {
  macros: Macros;
  vet: number;
}

export function MacroRings({ macros, vet }: MacroRingsProps) {
  const fracoes: Record<(typeof ANEIS)[number]["chave"], number> = {
    proteinas: macros.protocolo.proteinas,
    carboidratos: macros.protocolo.carboidratos,
    gorduras: macros.protocolo.gorduras,
  };
  const gramas: Record<(typeof ANEIS)[number]["chave"], number> = {
    proteinas: macros.proteinasG,
    carboidratos: macros.carboidratosG,
    gorduras: macros.gordurasG,
  };

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <svg
        aria-label="Distribuição de macronutrientes"
        className="shrink-0"
        height={190}
        role="img"
        viewBox="0 0 190 190"
        width={190}
      >
        {ANEIS.map(({ chave, raio, opacidade }) => {
          const circ = 2 * Math.PI * raio;
          const preenchido = circ * fracoes[chave];
          return (
            <g key={chave}>
              <circle
                cx={95}
                cy={95}
                fill="none"
                opacity={0.1}
                r={raio}
                stroke="currentColor"
                strokeWidth={11}
              />
              <circle
                cx={95}
                cy={95}
                fill="none"
                opacity={opacidade}
                r={raio}
                stroke="var(--accent)"
                strokeDasharray={`${preenchido} ${circ - preenchido}`}
                strokeLinecap="round"
                strokeWidth={11}
                transform="rotate(-90 95 95)"
                style={{ transition: "stroke-dasharray 400ms ease" }}
              />
            </g>
          );
        })}
        <text
          className="fill-current"
          fontSize={26}
          fontWeight={600}
          letterSpacing="-0.04em"
          textAnchor="middle"
          x={95}
          y={92}
        >
          {kcalFmt(vet)}
        </text>
        <text className="fill-current" fontSize={10} opacity={0.55} textAnchor="middle" x={95} y={108}>
          kcal/dia
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-3">
        {ANEIS.map(({ chave, rotulo, opacidade }) => (
          <li className="flex items-center gap-2.5" key={chave}>
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: "var(--accent)", opacity: opacidade }}
            />
            <span className="text-sm">{rotulo}</span>
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {g1Fmt(gramas[chave])} g
            </span>
            <span className="w-9 text-right text-xs tabular-nums opacity-55">
              {Math.round(fracoes[chave] * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
