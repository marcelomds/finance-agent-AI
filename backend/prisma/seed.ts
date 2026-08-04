import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Fixed IDs (not random cuids) so `db:fresh` is reproducible — the frontend's
// dev-only OrganizationContext hardcodes these until real auth exists.
const DEV_ORGANIZATION_ID = 'org_dev_acme';
const DEV_USER_ID = 'user_dev_test';

const DEFAULT_CATEGORIES = [
  { name: 'Travel - Accommodation', slug: 'travel_accommodation' },
  { name: 'Travel - Flights', slug: 'travel_flights' },
  { name: 'Travel - Meals', slug: 'travel_meals' },
  { name: 'Travel - Transport', slug: 'travel_transport' },
  { name: 'Software', slug: 'software' },
  { name: 'Office Supplies', slug: 'office_supplies' },
  { name: 'Meals & Entertainment', slug: 'meals_entertainment' },
  { name: 'Other', slug: 'other' },
];

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { id: DEV_ORGANIZATION_ID, name: 'Acme Inc', slug: 'acme' },
  });

  await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      id: DEV_USER_ID,
      email: 'test@test.com',
      name: 'Test User',
      organizationId: org.id,
    },
  });

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, organizationId: org.id })),
    skipDuplicates: true,
  });

  console.log(`Seeded organization "${org.name}" (${org.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
