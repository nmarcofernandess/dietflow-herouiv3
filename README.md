# DietFlow — Demo de Gestão de Pacientes

Réplica front-end, sem backend, da tela real de **Gestão de Pacientes**
(`src/components/patient/PatientManagement.tsx` no `dietflow-app`). Serve como
protótipo navegável — todo dado vive em memória e em `localStorage`, sem
Supabase, sem Prisma, sem Server Actions.

## Rodando

```bash
npm install
npm run dev
```

## Stack

Vite · React 19 · TypeScript · HeroUI v3 (`@heroui/react` + `@heroui/styles`,
componentes compostos sobre React Aria) · Tailwind CSS v4 · lucide-react.

## Onde está o estado compartilhado

`src/features/patients/usePatientsState.ts` é a fonte única de verdade da
tela. `PatientsPage.tsx` chama esse hook uma vez e distribui os mesmos dados e
handlers para `PatientCard`, `PatientsTable`, `BulkActionsBar` e todos os
modais — não existe cópia de estado por modo de visualização. Qualquer
mutação (criar, editar, arquivar, restaurar, excluir, tags/local/plano em
massa) atualiza o array `patients` uma vez, e Cards e Tabela re-renderizam a
partir dele — por isso uma edição feita num modo aparece instantaneamente no
outro.

## Fidelidade ao produto real

Este projeto foi construído para espelhar a anatomia real da tela, não um
mockup genérico de CRM:

- **Sem enum de status.** `Patient.status` foi removido do schema real; o
  eixo é `archivedAt`/`isActive`, exposto como toggle "Arquivados (N)".
- **Card enxuto.** Avatar + nome + "idade · último atendimento" — é isso que
  `BaseContentCard` mostra na produção. Telefone, plano e datas completas só
  aparecem na tabela ou no perfil.
- **"Excluir paciente" arquiva.** Copiado do comportamento real
  (`PatientManagement.tsx`): o item de menu chama arquivamento quando o
  paciente está ativo; só o paciente já arquivado tem "Excluir permanente".
- **Seleção é modo**, ativado pelo botão dedicado na toolbar — os checkboxes
  não ficam permanentemente visíveis.
- **Barra de ações em massa** só tem Gerenciar Tags / Migrar Local /
  Gerenciar planos — não existe exclusão em massa na tela real.

## Fora do escopo (por decisão, não por esquecimento)

O drawer "Cadastro do paciente" é um resumo leve para a ação "Acessar" ter um
destino — **não** é o perfil clínico real (`/paciente/[patientId]/`, com
dados-base, anamnese, antropometria, prescrição etc.), que é um módulo
inteiro fora do recorte de "Gestão de pacientes".
