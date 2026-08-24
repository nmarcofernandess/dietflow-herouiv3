import { Button, Dropdown, Label } from "@heroui/react";
import {
  ArchiveRestore,
  MoreVertical,
  Pencil,
  Phone,
  Trash2,
  UserRoundCog,
} from "lucide-react";

import type { Patient } from "@/types/patient";

type PatientAction = "access" | "contact" | "edit" | "delete" | "restore";

interface PatientActionsMenuProps {
  patient: Patient;
  onAccess: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onRestore: (patient: Patient) => void;
}

/**
 * Menu ⋮ do paciente — espelha `PatientCard.tsx` real: "Entrar em contato" /
 * "Editar dados cadastrais" / "Excluir paciente" quando ativo; "Restaurar" /
 * "Excluir permanente" quando arquivado. O verbo de exclusão muda de nome
 * (mas não de tipo de diálogo) conforme o estado — quem decide o texto do
 * diálogo é `requestDelete`, que sabe se o alvo está arquivado.
 */
export function PatientActionsMenu({
  patient,
  onAccess,
  onEdit,
  onDelete,
  onRestore,
}: PatientActionsMenuProps) {
  const handleAction = (key: PatientAction) => {
    switch (key) {
      case "access":
        onAccess(patient);
        break;
      case "contact":
        if (patient.phone) window.open(`tel:${patient.phone}`, "_self");
        break;
      case "edit":
        onEdit(patient);
        break;
      case "delete":
        onDelete(patient);
        break;
      case "restore":
        onRestore(patient);
        break;
    }
  };

  return (
    <Dropdown>
      <Button
        aria-label={`Ações de ${patient.fullName}`}
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <MoreVertical aria-hidden className="size-4" />
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          onAction={(key) => handleAction(String(key) as PatientAction)}
        >
          {patient.isActive ? (
            [
              <Dropdown.Item id="access" key="access" textValue="Acessar">
                <UserRoundCog aria-hidden className="size-4" />
                <Label>Acessar</Label>
              </Dropdown.Item>,
              ...(patient.phone
                ? [
                    <Dropdown.Item
                      id="contact"
                      key="contact"
                      textValue="Entrar em contato"
                    >
                      <Phone aria-hidden className="size-4" />
                      <div className="flex flex-col">
                        <Label>Entrar em contato</Label>
                        <span className="text-xs text-muted tnum">
                          {patient.phone}
                        </span>
                      </div>
                    </Dropdown.Item>,
                  ]
                : []),
              <Dropdown.Item id="edit" key="edit" textValue="Editar dados cadastrais">
                <Pencil aria-hidden className="size-4" />
                <Label>Editar dados cadastrais</Label>
              </Dropdown.Item>,
              <Dropdown.Item
                id="delete"
                key="delete"
                textValue="Excluir paciente"
                variant="danger"
              >
                <Trash2 aria-hidden className="size-4" />
                <Label>Excluir paciente</Label>
              </Dropdown.Item>,
            ]
          ) : (
            [
              <Dropdown.Item id="restore" key="restore" textValue="Restaurar">
                <ArchiveRestore aria-hidden className="size-4" />
                <Label>Restaurar</Label>
              </Dropdown.Item>,
              <Dropdown.Item
                id="delete"
                key="delete"
                textValue="Excluir permanente"
                variant="danger"
              >
                <Trash2 aria-hidden className="size-4" />
                <Label>Excluir permanente</Label>
              </Dropdown.Item>,
            ]
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
