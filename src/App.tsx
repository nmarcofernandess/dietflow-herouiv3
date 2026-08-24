import { Toast } from "@heroui/react";

import { PatientsPage } from "@/features/patients/PatientsPage";

export default function App() {
  return (
    <>
      <PatientsPage />
      <Toast.Provider placement="top end" />
    </>
  );
}
