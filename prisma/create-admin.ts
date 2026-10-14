import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!username || !/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
    throw new Error("Defina ADMIN_USERNAME com 3 a 32 caracteres válidos.");
  }
  if (!password || password.length < 10) {
    throw new Error("Defina ADMIN_PASSWORD com ao menos 10 caracteres.");
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Defina ADMIN_EMAIL com um e-mail válido.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: { name: "Erick do Carmo", email, passwordHash },
    create: { name: "Erick do Carmo", username, email, passwordHash },
  });

  console.log(`Usuário ${username} configurado com sucesso.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
