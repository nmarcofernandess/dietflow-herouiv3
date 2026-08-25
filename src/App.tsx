import { useState } from "react";
import { Toast, ToggleButton, ToggleButtonGroup } from "@heroui/react";
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
        <ToggleButtonGroup
          aria-label="Demo em exibição"
          className="border-border bg-surface/90 gap-1 rounded-full border p-1 shadow-lg backdrop-blur-md"
          disallowEmptySelection
          onSelectionChange={(keys) => {
            const [first] = Array.from(keys);
            if (first) setPage(String(first) as DemoPage);
          }}
          selectedKeys={[page]}
          selectionMode="single"
        >
          <ToggleButton
            className="data-selected:bg-foreground data-selected:text-background rounded-full text-xs font-semibold"
            id="calculo"
          >
            <Calculator aria-hidden className="size-3.5" />
            Cálculo
          </ToggleButton>
          <ToggleButton
            className="data-selected:bg-foreground data-selected:text-background rounded-full text-xs font-semibold"
            id="pacientes"
          >
            <Users aria-hidden className="size-3.5" />
            Pacientes
          </ToggleButton>
        </ToggleButtonGroup>
      </nav>

      <Toast.Provider placement="top end" />
    </>
  );
}
