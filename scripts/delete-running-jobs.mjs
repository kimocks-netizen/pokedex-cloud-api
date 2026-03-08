import { getPrismaClient } from '../src/shared/config/database.mjs';

const prisma = getPrismaClient();

async function deleteRunningJobs() {
  const result = await prisma.ingestionJob.deleteMany({
    where: { status: 'running' }
  });
  console.log(`Deleted ${result.count} running jobs`);
  process.exit(0);
}

deleteRunningJobs();
