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
    update: { passwordHash },
    create: {
      id: "demo-user-id",
      name: "Advogado Demo",
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
      phone: "11999887766",
      whatsapp: "11999887766",
      birthDate: new Date(currentYear, today.getMonth(), today.getDate()),
      notes: "Cliente desde 2020",
    },
    {
      name: "João Santos",
      personType: "PF" as const,
      document: "98765432100",
      phone: "21988776655",
      whatsapp: null,
      birthDate: new Date(currentYear, today.getMonth(), today.getDate() + 3),
      notes: null,
    },
    {
      name: "Escritório ABC Ltda",
      personType: "PJ" as const,
      document: "11222333000144",
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

  const process = await prisma.process.upsert({
    where: {
      clientId_processNumber: {
        clientId: clients[0].id,
        processNumber: "0001234-56.2024.8.26.0100",
      },
    },
    update: {},
    create: {
      processNumber: "0001234-56.2024.8.26.0100",
      court: "1ª Vara Cível de São Paulo",
      area: "CIVEL",
      status: "ATIVO",
      value: 50000,
      notes: "Ação de cobrança",
      clientId: clients[0].id,
    },
  });

  await prisma.processTimeline.createMany({
    data: [
      {
        processId: process.id,
        title: "Distribuição",
        description: "Processo distribuído ao juízo.",
        date: new Date("2024-03-15T10:00:00"),
      },
      {
        processId: process.id,
        title: "Publicação",
        description: "Publicado no DJE.",
        date: new Date("2024-04-02T14:30:00"),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.document.upsert({
    where: { id: "seed-doc-1" },
    update: {},
    create: {
      id: "seed-doc-1",
      fileName: "peticao-inicial.pdf",
      fileUrl: `uploads/${user.id}/${process.id}/seed-peticao-inicial.pdf`,
      category: "Petição",
      userId: user.id,
      clientId: clients[0].id,
      processId: process.id,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Audiência de conciliação",
        description: "Comparecer com procuração e documentos.",
        eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 2, 14, 0),
        type: "AUDIENCIA",
        status: "PENDENTE",
        userId: user.id,
        processId: process.id,
      },
      {
        title: "Prazo para contestação",
        description: "Prazo fatal — parte ré.",
        eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 10, 23, 59),
        type: "PRAZO",
        status: "PENDENTE",
        userId: user.id,
        processId: process.id,
      },
      {
        title: "Reunião com cliente",
        description: "Alinhamento estratégico.",
        eventDate: new Date(currentYear, today.getMonth(), today.getDate() + 1, 10, 0),
        type: "REUNIAO",
        status: "PENDENTE",
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído com sucesso!");
  console.log("Usuário demo criado: advogado@crm.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
