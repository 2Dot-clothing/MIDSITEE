import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seeds the data every environment needs to boot cleanly and to exercise
// the auth flow end to end: a SiteSettings row, one ADMIN account, and one
// CUSTOMER account. Products/categories/marketplaces are still left for a
// later part once the admin dashboard has real CRUD.
async function main() {
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: { footerTagline: "FISH THE FIT" },
    });
    console.log("Created default SiteSettings row.");
  } else {
    console.log("SiteSettings row already exists, skipping.");
  }

  // These are dev-only fixtures so registration/login/role-gating can be
  // tested immediately after `npm run db:seed` — rotate or remove both
  // before shipping to a real production database.
  const seedAccounts = [
    { email: "admin@2dot.test", name: "2DOT Admin", password: "AdminPass123", role: "ADMIN" as const },
    { email: "customer@2dot.test", name: "Test Customer", password: "CustomerPass123", role: "CUSTOMER" as const },
  ];

  for (const account of seedAccounts) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) {
      console.log(`User ${account.email} already exists, skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.user.create({
      data: {
        email: account.email,
        name: account.name,
        passwordHash,
        role: account.role,
      },
    });
    console.log(`Created ${account.role} user: ${account.email} / ${account.password}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
