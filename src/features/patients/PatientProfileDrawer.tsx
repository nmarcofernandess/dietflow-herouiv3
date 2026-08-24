import { Button, Drawer, Separator } from "@heroui/react";
import { CalendarCheck, CalendarClock, IdCard, Mail, MapPin, Pencil, Phone, Tag } from "lucide-react";
import type { ReactNode } from "react";

import { calcAge, formatFullDate } from "@/lib/format";
import type { Location, Patient, PlanoAtendimento } from "@/types/patient";

import { PatientAvatar } from "./PatientAvatar";

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  isMuted?: boolean;
}

function DetailRow({ icon, label, value, isMuted }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p
          className={
            isMuted
              ? "mt-0.5 text-sm text-muted"
              : "mt-0.5 break-words text-sm font-medium text-foreground tnum"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface PatientProfileDrawerProps {
  patient: Patient | null;
  locations: Location[];
  planos: PlanoAtendimento[];
  onClose: () => void;
  onEdit: (patient: Patient) => void;
}

/**
 * Resumo do paciente ao clicar no card/"Acessar". NÃO é o perfil clínico real
 * (`/paciente/[patientId]/`, com dados-base, anamnese, antropometria,
 * prescrição etc.) — aquele é um módulo inteiro fora do escopo de "Gestão de
 * pacientes". Este drawer é o cadastro que a própria Gestão de Pacientes
 * conhece, para a ação "Acessar" ter um destino real em vez de decorativo.
 */
export function PatientProfileDrawer({
  patient,
  locations,
  planos,
  onClose,
  onEdit,
}: PatientProfileDrawerProps) {
  const location = patient?.locationId
    ? locations.find((item) => item.id === patient.locationId)
    : undefined;
  const plano = patient?.planoAtendimentoId
    ? planos.find((item) => item.id === patient.planoAtendimentoId)
    : undefined;

  return (
    <Drawer isOpen={patient !== null} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-full sm:max-w-md">
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Cadastro do paciente</Drawer.Heading>
            </Drawer.Header>

            {patient ? (
              <>
                <Drawer.Body>
                  <div className="flex items-center gap-4">
                    <PatientAvatar name={patient.fullName} size="card" />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                        {patient.fullName}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted tnum">
                        {calcAge(patient.birthDate)} anos · {formatFullDate(patient.birthDate)}
                      </p>
                    </div>
                  </div>

                  {patient.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {patient.tags.map((tag) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium text-foreground"
                          key={tag}
                        >
                          <Tag aria-hidden className="size-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <Separator className="my-4" />

                  <div className="divide-y divide-separator">
                    <DetailRow
                      icon={<Phone aria-hidden className="size-4" />}
                      isMuted={!patient.phone}
                      label="Telefone"
                      value={patient.phone ?? "Não informado"}
                    />
                    <DetailRow
                      icon={<Mail aria-hidden className="size-4" />}
                      isMuted={!patient.email}
                      label="E-mail"
                      value={patient.email ?? "Não informado"}
                    />
                    <DetailRow
                      icon={<IdCard aria-hidden className="size-4" />}
                      isMuted={!patient.cpf}
                      label="CPF"
                      value={patient.cpf ?? "Não informado"}
                    />
                    <DetailRow
                      icon={<MapPin aria-hidden className="size-4" />}
                      isMuted={!location}
                      label="Local de atendimento"
                      value={location?.name ?? "Sem local definido"}
                    />
                    <DetailRow
                      icon={<CalendarCheck aria-hidden className="size-4" />}
                      isMuted={!patient.lastConsultationDate}
                      label="Último atendimento"
                      value={
                        patient.lastConsultationDate
                          ? formatFullDate(patient.lastConsultationDate)
                          : "Ainda não atendido"
                      }
                    />
                    <DetailRow
                      icon={<CalendarClock aria-hidden className="size-4" />}
                      isMuted={!patient.nextAppointmentDate}
                      label="Próximo atendimento"
                      value={
                        patient.nextAppointmentDate
                          ? formatFullDate(patient.nextAppointmentDate)
                          : "Sem agendamento"
                      }
                    />
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Plano de atendimento
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {plano?.nome ?? "Sem plano"}
                    </p>
                  </div>
                </Drawer.Body>

                <Drawer.Footer>
                  <Button onPress={() => onEdit(patient)}>
                    <Pencil aria-hidden className="size-4" />
                    Editar cadastro
                  </Button>
                </Drawer.Footer>
              </>
            ) : null}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
