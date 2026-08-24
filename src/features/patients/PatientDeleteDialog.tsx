import { AlertDialog, Button } from "@heroui/react";

import type { Patient } from "@/types/patient";

interface PatientDeleteDialogProps {
  isOpen: boolean;
  patients: Patient[];
  isPermanent: boolean;
  onClose: () => void;
  onConfirm: (patients: Patient[], isPermanent: boolean) => void;
}

/**
 * Espelha `DeleteConfirmationModal` + `DELETE_MODAL`. O item de menu diz
 * "Excluir paciente", mas para um paciente ATIVO isso arquiva — reversível,
 * com restore em Arquivados. Só o paciente já arquivado tem exclusão de
 * verdade ("Excluir permanente"), e mesmo essa é soft no banco: some da lista
 * do nutricionista, mas seguem recuperáveis pelo admin. O título e o botão do
 * diálogo usam a copy real (`DELETE_MODAL.TITLE_ARCHIVE`/`TITLE_PERMANENT`),
 * não o rótulo do menu que abriu o diálogo.
 */
export function PatientDeleteDialog({
  isOpen,
  patients,
  isPermanent,
  onClose,
  onConfirm,
}: PatientDeleteDialogProps) {
  const title = isPermanent ? "Excluir permanentemente?" : "Arquivar?";
  const confirmLabel = isPermanent ? "Excluir permanentemente" : "Arquivar";
  const notice = isPermanent
    ? "Sai da sua lista e dos Arquivados."
    : "Você poderá restaurar os itens arquivados posteriormente.";

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-full max-w-md">
            <AlertDialog.Header>
              <AlertDialog.Icon status={isPermanent ? "danger" : "warning"} />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <ul className="max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-foreground">
                {patients.map((patient) => (
                  <li key={patient.id}>{patient.fullName}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">{notice}</p>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button onPress={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button
                onPress={() => onConfirm(patients, isPermanent)}
                variant={isPermanent ? "danger" : "primary"}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
