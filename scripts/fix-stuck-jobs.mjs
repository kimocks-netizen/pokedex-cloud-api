import { getPrismaClient } from '../src/shared/config/database.mjs';

/**
 * Fix stuck ingestion jobs
 * Jobs with processedRecords === totalRecords should be marked as completed
 */
async function fixStuckJobs() {
  const prisma = getPrismaClient();
  
  try {
    console.log('Finding stuck jobs...');
    
    const stuckJobs = await prisma.ingestionJob.findMany({
      where: {
        status: 'running',
        processedRecords: {
          gte: prisma.ingestionJob.fields.totalRecords
        }
      }
    });
    
    console.log(`Found ${stuckJobs.length} stuck jobs`);
    
    for (const job of stuckJobs) {
      if (job.processedRecords >= job.totalRecords) {
        console.log(`Fixing job ${job.id}: ${job.processedRecords}/${job.totalRecords}`);
        
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
      }
    }
    
    console.log('✅ All stuck jobs fixed!');
  } catch (error) {
    console.error('Error fixing jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStuckJobs();
