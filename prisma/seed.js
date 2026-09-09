// prisma/seed.js
// Cria o primeiro usuário admin. Rode LOCALMENTE uma única vez.
//
// Uso:
//   DATABASE_URL="<url de produção>" SEED_ADMIN_EMAIL="voce@seuemail.com" node prisma/seed.js
//
// Variáveis opcionais:
//   SEED_ADMIN_NAME (padrão: Administrador)

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const name = process.env.SEED_ADMIN_NAME || "Administrador";

  if (!email) {
    throw new Error(
      "Defina a variável SEED_ADMIN_EMAIL antes de rodar o seed (ex: SEED_ADMIN_EMAIL=\"voce@seuemail.com\" node prisma/seed.js).",
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { name },
    create: { name, email: normalizedEmail, role: "ADMIN" },
  });

  console.log(`Usuário admin pronto: ${user.email} (role: ${user.role})`);
  console.log("Agora é só entrar em /login com esse e-mail para receber o código de acesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao rodar o seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
