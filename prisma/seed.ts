import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("O seed de demonstração não pode ser executado em produção.");
  }

  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 12) {
    throw new Error(
      "Defina SEED_DEMO_PASSWORD com ao menos 12 caracteres antes de executar o seed."
    );
  }

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: "advogado@crm.local" },
    update: { passwordHash, username: "advogado" },
    create: {
      id: "demo-user-id",
      name: "Advogado Demo",
      username: "advogado",
      email: "advogado@crm.local",
      passwordHash,
    },
  });

  const today = new Date();
  const currentYear = today.getFullYear();

  const sampleClients = [
    {
      name: "Maria Silva",
      personType: "PF" as const,
      document: "12345678901",
      email: "maria.silva@exemplo.com",
      phone: "11999887766",
      whatsapp: "11999887766",
      birthDate: new Date(currentYear, today.getMonth(), today.getDate()),
      notes: "Cliente desde 2020",
    },
    {
      name: "João Santos",
      personType: "PF" as const,
      document: "98765432100",
      email: "joao.santos@exemplo.com",
      phone: "21988776655",
      whatsapp: null,
      birthDate: new Date(currentYear, today.getMonth(), today.getDate() + 3),
      notes: null,
    },
    {
      name: "Escritório ABC Ltda",
      personType: "PJ" as const,
      document: "11222333000144",
      email: "contato@escritorioabc.com.br",
      phone: "1133445566",
      whatsapp: "11988776655",
      birthDate: new Date(currentYear, today.getMonth(), today.getDate() + 5),
      notes: "Empresa parceira",
    },
  ];

  const clients = [];
  for (const client of sampleClients) {
    const created = await prisma.client.upsert({
      where: {
        userId_document: {
          userId: user.id,
          document: client.document,
        },
      },
      update: {},
      create: {
        ...client,
        userId: user.id,
      },
    });
    clients.push(created);
  }

  const legalProcess = await prisma.process.upsert({
    where: {
      clientId_processNumber: {
        clientId: clients[0].id,
        processNumber: "0001234-71.2024.8.26.0100",
      },
    },
    update: {},
    create: {
      processNumber: "0001234-71.2024.8.26.0100",
      court: "1ª Vara Cível de São Paulo",
      area: "CIVEL",
      status: "ATIVO",
      value: 50000,
      notes: "Ação de cobrança",
      clientId: clients[0].id,
    },
  });

  const timelineEntries = [
    {
      id: "seed-timeline-1",
      processId: legalProcess.id,
      title: "Distribuição",
      description: "Processo distribuído ao juízo.",
      date: new Date("2024-03-15T10:00:00"),
    },
    {
      id: "seed-timeline-2",
      processId: legalProcess.id,
      title: "Publicação",
      description: "Publicado no DJE.",
      date: new Date("2024-04-02T14:30:00"),
    },
  ];

  for (const entry of timelineEntries) {
    await prisma.processTimeline.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  // O documento fictício antigo não tem arquivo no storage; remove o registro
  // para o seed não deixar uma referência quebrada.
  await prisma.document.deleteMany({ where: { id: "seed-doc-1" } });

  const eventEntries = [
    {
      id: "seed-event-1",
      title: "Audiência de conciliação",
      description: "Comparecer com procuração e documentos.",
      eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 2, 14, 0),
      type: "AUDIENCIA" as const,
      status: "PENDENTE" as const,
      userId: user.id,
      processId: legalProcess.id,
    },
    {
      id: "seed-event-2",
      title: "Prazo para contestação",
      description: "Prazo fatal — parte ré.",
      eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 10, 23, 59),
      type: "PRAZO" as const,
      status: "PENDENTE" as const,
      userId: user.id,
      processId: legalProcess.id,
    },
    {
      id: "seed-event-3",
      title: "Reunião com cliente",
      description: "Alinhamento estratégico.",
      eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 1, 10, 0),
      type: "REUNIAO" as const,
      status: "PENDENTE" as const,
      userId: user.id,
    },
  ];

  for (const entry of eventEntries) {
    await prisma.event.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  console.log("Seed concluído com sucesso!");
  console.log("Usuário demo pronto para login: advogado (e-mail cadastrado: advogado@crm.local)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
