import { useState } from "react";
import { Toast } from "@heroui/react";
import { Calculator, Users } from "lucide-react";

import { PatientsPage } from "@/features/patients/PatientsPage";
import { CalculoPage } from "@/features/calculo/CalculoPage";

type DemoPage = "calculo" | "pacientes";

/**
 * Switcher de demos: cada página é autocontida (header e tema próprios);
 * o App só decide qual renderizar e oferece o pill flutuante de navegação.
 */
export default function App() {
  const [page, setPage] = useState<DemoPage>("calculo");

  return (
    <>
      {page === "pacientes" ? <PatientsPage /> : <CalculoPage />}

      <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        <div className="border-border bg-surface/90 flex items-center gap-1 rounded-full border p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPage("calculo")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              page === "calculo"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Calculator className="size-3.5" />
            Cálculo
          </button>
          <button
            type="button"
            onClick={() => setPage("pacientes")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              page === "pacientes"
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Users className="size-3.5" />
            Pacientes
          </button>
        </div>
      </nav>

      <Toast.Provider placement="top end" />
    </>
  );
}
