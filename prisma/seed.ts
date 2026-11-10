import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

// Initialize the database pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Instantiate the driver adapter
const adapter = new PrismaPg(pool)

// Pass the adapter directly to Prisma Client
export const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);
  config.defaultAccounts.forEach(async (account) => {
    const role = account.role as Role || Role.USER;
    console.log(`  Creating user: ${account.email} with role: ${role}`);
    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        password,
      },
      create: {
        email: account.email,
        password,
        role,
      },
    });
    // console.log(`  Created user: ${user.email} with role: ${user.role}`);
  });
  config.defaultContacts.forEach(async (contact, index) => {
    console.log(`  Adding contact: ${contact.firstName} ${contact.lastName}`);
    await prisma.contact.upsert({
      where: { id: index},
      update: {},
      create: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        address: contact.address,
        image: contact.image,
        description: contact.description,
        owner: contact.owner
      },
    });
    // console.log(`  Created user: ${user.email} with role: ${user.role}`);
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
