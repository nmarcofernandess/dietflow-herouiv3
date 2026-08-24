import { Button, Input, Label, Modal, TextField } from "@heroui/react";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { pluralize } from "@/lib/format";
import { normalizeTags, type Patient } from "@/types/patient";

import { PatientAvatar } from "../PatientAvatar";
import { SelectionCheckbox } from "../SelectionCheckbox";

interface TagsBulkDialogProps {
  isOpen: boolean;
  patients: Patient[];
  allTags: string[];
  onClose: () => void;
  onApply: (patients: Patient[], tagsToAdd: string[], tagsToRemove: string[]) => void;
}

/**
 * Simplificação honesta de `TagManagementModal`: o real edita tag a tag por
 * paciente (grid com autocomplete e sugestões). Aqui o gesto de massa é único
 * — um conjunto de tags aplicado a todos os selecionados — porque é o que a
 * ação "Gerenciar Tags" da barra de seleção promete: mudar N pacientes de
 * uma vez, não abrir um editor por paciente.
 */
export function TagsBulkDialog({
  isOpen,
  patients,
  allTags,
  onClose,
  onApply,
}: TagsBulkDialogProps) {
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTagsToAdd([]);
      setTagsToRemove([]);
      setCustomTag("");
    }
  }, [isOpen]);

  const commonTags = allTags.filter((tag) =>
    patients.every((patient) => patient.tags.includes(tag)),
  );

  const toggleAdd = (tag: string) => {
    setTagsToAdd((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag],
    );
  };

  const toggleRemove = (tag: string) => {
    setTagsToRemove((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag],
    );
  };

  const addCustomTag = () => {
    const [tag] = normalizeTags([customTag]);
    if (tag && !tagsToAdd.includes(tag)) setTagsToAdd((previous) => [...previous, tag]);
    setCustomTag("");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Gerenciar tags</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p className="text-sm text-muted">
                {pluralize(patients.length, "paciente selecionado", "pacientes selecionados")}
              </p>
              <div className="mt-2 flex -space-x-2">
                {patients.slice(0, 8).map((patient) => (
                  <PatientAvatar
                    className="ring-2 ring-surface"
                    key={patient.id}
                    name={patient.fullName}
                    size="sm"
                  />
                ))}
                {patients.length > 8 ? (
                  <span className="flex size-8 items-center justify-center rounded-full bg-surface-tertiary text-xs font-medium text-muted ring-2 ring-surface">
                    +{patients.length - 8}
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Adicionar tags
                </Label>
                <div className="mt-2 flex gap-2">
                  <TextField
                    className="flex-1"
                    onChange={setCustomTag}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomTag();
                      }
                    }}
                    value={customTag}
                  >
                    <Input placeholder="Nova tag" />
                  </TextField>
                  <Button isIconOnly onPress={addCustomTag} variant="outline">
                    <Plus aria-hidden className="size-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...new Set([...tagsToAdd, ...allTags])].map((tag) => {
                    const isSelected = tagsToAdd.includes(tag);
                    return (
                      <button
                        className={
                          isSelected
                            ? "rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                            : "rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-tertiary"
                        }
                        key={tag}
                        onClick={() => toggleAdd(tag)}
                        type="button"
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {commonTags.length > 0 ? (
                <div className="mt-5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Remover tags (comuns a todos os selecionados)
                  </Label>
                  <div className="mt-2 flex flex-col gap-0.5">
                    {commonTags.map((tag) => (
                      <label
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-secondary"
                        key={tag}
                      >
                        <SelectionCheckbox
                          aria-label={`Remover ${tag}`}
                          isSelected={tagsToRemove.includes(tag)}
                          onChange={() => toggleRemove(tag)}
                        />
                        <span className="flex-1 text-sm text-foreground">{tag}</span>
                        {tagsToRemove.includes(tag) ? (
                          <X aria-hidden className="size-3.5 text-danger" />
                        ) : null}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </Modal.Body>

            <Modal.Footer>
              <Button onPress={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button
                isDisabled={tagsToAdd.length === 0 && tagsToRemove.length === 0}
                onPress={() => onApply(patients, tagsToAdd, tagsToRemove)}
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
