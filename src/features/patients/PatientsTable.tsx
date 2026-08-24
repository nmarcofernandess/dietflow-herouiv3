import { Table } from "@heroui/react";
import type { Selection } from "@heroui/react";

import { formatRelativeTableDate, formatShortYearDate } from "@/lib/format";
import type { Location, Patient } from "@/types/patient";

import { PatientActionsMenu } from "./PatientActionsMenu";
import { PatientAvatar } from "./PatientAvatar";
import { SelectionCheckbox } from "./SelectionCheckbox";

interface PatientsTableProps {
  patients: Patient[];
  locations: Location[];
  selectedKeys: Selection;
  onSelectionChange: (keys: Selection) => void;
  onAccess: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onRestore: (patient: Patient) => void;
}

/**
 * Réplica das 4 colunas reais de `tableColumns` em `PatientManagement.tsx`:
 * Paciente (`PersonCell`: avatar + nome + telefone como subtítulo), Local,
 * Último Atend. e Próximo Atend. — cada data com linha relativa + absoluta.
 * Não existem colunas de Plano, Status ou Tags na tabela real.
 */
export function PatientsTable({
  patients,
  locations,
  selectedKeys,
  onSelectionChange,
  onAccess,
  onEdit,
  onDelete,
  onRestore,
}: PatientsTableProps) {
  const byId = new Map(patients.map((patient) => [patient.id, patient]));
  const locationById = new Map(locations.map((location) => [location.id, location]));

  return (
    <Table className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Pacientes"
          className="min-w-[760px]"
          onRowAction={(key) => {
            const patient = byId.get(String(key));
            if (patient?.isActive) onAccess(patient);
          }}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
          selectionBehavior="toggle"
          selectionMode="multiple"
        >
          <Table.Header>
            <Table.Column className="w-12 pr-0">
              <SelectionCheckbox
                aria-label="Selecionar todos os pacientes visíveis"
                slot="selection"
              />
            </Table.Column>
            <Table.Column isRowHeader>Paciente</Table.Column>
            <Table.Column className="max-lg:hidden">Local</Table.Column>
            <Table.Column>Último atend.</Table.Column>
            <Table.Column className="max-md:hidden">Próximo atend.</Table.Column>
            <Table.Column className="w-14 text-right">
              <span className="sr-only">Ações</span>
            </Table.Column>
          </Table.Header>

          <Table.Body>
            {patients.map((patient) => {
              const location = patient.locationId
                ? locationById.get(patient.locationId)
                : undefined;

              return (
                <Table.Row id={patient.id} key={patient.id}>
                  <Table.Cell className="pr-0">
                    <SelectionCheckbox
                      aria-label={`Selecionar ${patient.fullName}`}
                      slot="selection"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={patient.fullName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {patient.fullName}
                        </p>
                        <p className="truncate text-xs text-muted tnum">
                          {patient.phone ?? "Sem telefone"}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="max-lg:hidden">
                    <span className="text-sm text-foreground">
                      {location?.name ?? "Sem local"}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {formatRelativeTableDate(patient.lastConsultationDate, "past")}
                      </span>
                      <span className="text-xs text-muted tnum">
                        {formatShortYearDate(patient.lastConsultationDate)}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="max-md:hidden">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {formatRelativeTableDate(patient.nextAppointmentDate, "future")}
                      </span>
                      <span className="text-xs text-muted tnum">
                        {formatShortYearDate(patient.nextAppointmentDate)}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="text-right">
                    <PatientActionsMenu
                      onAccess={onAccess}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onRestore={onRestore}
                      patient={patient}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
