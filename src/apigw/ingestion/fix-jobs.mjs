import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { requireAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * POST /ingestion/jobs/fix - Fix stuck running jobs
 */
export const handler = async (event) => {
  try {
    await requireAuth(event, ['admin']);

    const prisma = getPrismaClient();
    
    // Find all running jobs
    const runningJobs = await prisma.ingestionJob.findMany({
      where: { status: 'running' },
    });

    const fixed = [];
    
    for (const job of runningJobs) {
      // Check if job should be completed
      if (job.processedRecords + job.failedRecords >= job.totalRecords) {
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: job.failedRecords === job.totalRecords ? 'failed' : 'completed',
            completedAt: new Date(),
          },
        });
        fixed.push(job.id);
      }
    }

    return ResponseHelper.success({
      message: `Fixed ${fixed.length} stuck jobs`,
      fixedJobs: fixed,
      totalRunning: runningJobs.length,
    });
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
