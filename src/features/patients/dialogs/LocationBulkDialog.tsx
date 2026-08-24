import { Button, Modal, Radio, RadioGroup } from "@heroui/react";
import { useEffect, useState } from "react";

import { pluralize } from "@/lib/format";
import type { Location, Patient } from "@/types/patient";

interface LocationBulkDialogProps {
  isOpen: boolean;
  patients: Patient[];
  locations: Location[];
  onClose: () => void;
  onApply: (patients: Patient[], locationId: string) => void;
}

/** Réplica simplificada de `LocationMigrationModal`: destino único para todos os selecionados. */
export function LocationBulkDialog({
  isOpen,
  patients,
  locations,
  onClose,
  onApply,
}: LocationBulkDialogProps) {
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setTargetId(null);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Migrar local</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-sm text-muted">
                Mover{" "}
                {pluralize(patients.length, "paciente selecionado", "pacientes selecionados")}{" "}
                para:
              </p>
              <RadioGroup
                className="mt-3"
                onChange={setTargetId}
                value={targetId ?? ""}
              >
                {locations.map((location) => (
                  <Radio key={location.id} value={location.id}>
                    <Radio.Content className="gap-2.5">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {location.name}
                        </p>
                        <p className="text-xs text-muted">{location.addressCity}</p>
                      </div>
                    </Radio.Content>
                  </Radio>
                ))}
              </RadioGroup>
            </Modal.Body>

            <Modal.Footer>
              <Button onPress={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button
                isDisabled={!targetId}
                onPress={() => targetId && onApply(patients, targetId)}
              >
                Migrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
