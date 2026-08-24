import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { maskCPF, maskPhone } from "@/lib/format";
import {
  GENDER_LABEL,
  type Gender,
  type Location,
  type Patient,
  type PatientDraft,
  type PlanoAtendimento,
} from "@/types/patient";

const EMPTY_DRAFT: PatientDraft = {
  fullName: "",
  birthDate: "",
  gender: "FEMALE",
  email: null,
  phone: null,
  cpf: null,
  instagramUsername: null,
  tags: [],
  locationId: null,
  planoAtendimentoId: null,
};

function toDraft(patient: Patient | null): PatientDraft {
  if (!patient) return EMPTY_DRAFT;
  const { id: _id, isActive: _isActive, archivedAt: _archivedAt, lastConsultationDate: _lc, nextAppointmentDate: _na, updatedAt: _u, ...draft } = patient;
  return draft;
}

interface PatientFormModalProps {
  isOpen: boolean;
  /** `null` = criação; preenchido = edição. */
  patient: Patient | null;
  locations: Location[];
  planos: PlanoAtendimento[];
  onClose: () => void;
  onSubmit: (draft: PatientDraft, id: string | null) => void;
}

/**
 * Espelha `PatientRegistrationModal` / `patientWriteSchema`: só `fullName`,
 * `birthDate` e `gender` são obrigatórios no banco. Telefone, e-mail e CPF são
 * `String?` — a UI não pode inventar uma regra de "telefone ou e-mail
 * obrigatório" que o schema não tem.
 */
export function PatientFormModal({
  isOpen,
  patient,
  locations,
  planos,
  onClose,
  onSubmit,
}: PatientFormModalProps) {
  const [draft, setDraft] = useState<PatientDraft>(() => toDraft(patient));
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(toDraft(patient));
      setNameError(null);
    }
  }, [isOpen, patient]);

  const isEditing = patient !== null;

  const patch = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = () => {
    const fullName = draft.fullName.trim();
    if (!fullName) {
      setNameError("Informe o nome completo do paciente.");
      return;
    }
    if (!draft.birthDate) return;

    onSubmit(
      {
        ...draft,
        fullName,
        email: draft.email?.trim() || null,
        phone: draft.phone?.trim() || null,
        cpf: draft.cpf?.trim() || null,
        instagramUsername: draft.instagramUsername?.trim() || null,
      },
      patient?.id ?? null,
    );
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isEditing ? "Editar paciente" : "Novo paciente"}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  className="sm:col-span-2"
                  isInvalid={Boolean(nameError)}
                  isRequired
                  onChange={(value) => {
                    patch("fullName", value);
                    if (value.trim()) setNameError(null);
                  }}
                  value={draft.fullName}
                >
                  <Label>Nome completo</Label>
                  <Input placeholder="Ex.: Ana Beatriz Nogueira" />
                  {nameError ? (
                    <p className="mt-1 text-xs text-danger">{nameError}</p>
                  ) : null}
                </TextField>

                <TextField
                  isRequired
                  onChange={(value) => patch("birthDate", value)}
                  value={draft.birthDate}
                >
                  <Label>Data de nascimento</Label>
                  <Input type="date" />
                </TextField>

                <Select
                  onSelectionChange={(key) => patch("gender", String(key) as Gender)}
                  selectedKey={draft.gender}
                >
                  <Label>Sexo</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {(Object.keys(GENDER_LABEL) as Gender[]).map((gender) => (
                        <ListBox.Item id={gender} key={gender} textValue={GENDER_LABEL[gender]}>
                          {GENDER_LABEL[gender]}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <TextField
                  onChange={(value) => patch("email", value)}
                  type="email"
                  value={draft.email ?? ""}
                >
                  <Label>E-mail (opcional)</Label>
                  <Input placeholder="nome@email.com" />
                </TextField>

                <TextField
                  onChange={(value) => patch("phone", maskPhone(value))}
                  value={draft.phone ?? ""}
                >
                  <Label>Telefone (opcional)</Label>
                  <Input inputMode="tel" placeholder="(11) 98765-4321" />
                </TextField>

                <TextField
                  onChange={(value) => patch("cpf", maskCPF(value))}
                  value={draft.cpf ?? ""}
                >
                  <Label>CPF (opcional)</Label>
                  <Input inputMode="numeric" placeholder="000.000.000-00" />
                </TextField>

                <TextField
                  onChange={(value) => patch("instagramUsername", value)}
                  value={draft.instagramUsername ?? ""}
                >
                  <Label>Instagram (opcional)</Label>
                  <Input placeholder="usuario" />
                </TextField>

                <Select
                  onSelectionChange={(key) =>
                    patch("locationId", key === "none" ? null : String(key))
                  }
                  selectedKey={draft.locationId ?? "none"}
                >
                  <Label>Local de atendimento</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="none" textValue="Sem local definido">
                        Sem local definido
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {locations.map((location) => (
                        <ListBox.Item id={location.id} key={location.id} textValue={location.name}>
                          {location.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  onSelectionChange={(key) =>
                    patch("planoAtendimentoId", key === "none" ? null : String(key))
                  }
                  selectedKey={draft.planoAtendimentoId ?? "none"}
                >
                  <Label>Plano de atendimento</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="none" textValue="Sem plano">
                        Sem plano
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {planos.map((plano) => (
                        <ListBox.Item id={plano.id} key={plano.id} textValue={plano.nome}>
                          {plano.nome}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button onPress={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button onPress={handleSubmit}>
                {isEditing ? "Salvar alterações" : "Cadastrar paciente"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
