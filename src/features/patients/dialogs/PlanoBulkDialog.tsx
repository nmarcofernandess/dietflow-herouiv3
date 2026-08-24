import { Button, Modal, Radio, RadioGroup } from "@heroui/react";
import { useEffect, useState } from "react";

import { pluralize } from "@/lib/format";
import type { Patient, PlanoAtendimento } from "@/types/patient";

const NONE_VALUE = "__none__";

interface PlanoBulkDialogProps {
  isOpen: boolean;
  patients: Patient[];
  planos: PlanoAtendimento[];
  onClose: () => void;
  onApply: (patients: Patient[], planoAtendimentoId: string | null) => void;
}

/** Réplica simplificada de `PlanoBulkAssignmentModal`: plano único para todos os selecionados. */
export function PlanoBulkDialog({
  isOpen,
  patients,
  planos,
  onClose,
  onApply,
}: PlanoBulkDialogProps) {
  const [targetId, setTargetId] = useState<string>(NONE_VALUE);

  useEffect(() => {
    if (isOpen) setTargetId(NONE_VALUE);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Gerenciar planos</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-sm text-muted">
                Definir plano de atendimento para{" "}
                {pluralize(patients.length, "paciente selecionado", "pacientes selecionados")}:
              </p>
              <RadioGroup className="mt-3" onChange={setTargetId} value={targetId}>
                <Radio value={NONE_VALUE}>
                  <Radio.Content className="gap-2.5">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <span className="text-sm text-foreground">Sem plano</span>
                  </Radio.Content>
                </Radio>
                {planos.map((plano) => (
                  <Radio key={plano.id} value={plano.id}>
                    <Radio.Content className="gap-2.5">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <span className="text-sm text-foreground">{plano.nome}</span>
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
                onPress={() =>
                  onApply(patients, targetId === NONE_VALUE ? null : targetId)
                }
              >
                Aplicar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
