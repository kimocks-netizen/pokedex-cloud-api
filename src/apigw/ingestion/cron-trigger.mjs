import { IngestionService } from '../../shared/services/ingestion-service.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { getPrismaClient } from '../../shared/config/database.mjs';

/**
 * EventBridge Cron - Trigger Pokemon ingestion based on scheduled job config
 */
export const handler = async (event) => {
  try {
    const prisma = getPrismaClient();
    
    // Get the first enabled scheduled job (in production, you'd pass jobId via event)
    const scheduledJob = await prisma.scheduledJob.findFirst({
      where: { enabled: true },
    });

    const limit = scheduledJob?.pokemonLimit || parseInt(process.env.POKEMON_LIMIT) || 151;
    
    const ingestionService = new IngestionService();
    const result = await ingestionService.startIngestion(limit, 'cron');

    console.log(`Ingestion job ${result.jobId} started with ${result.totalRecords} Pokemon`);

    return ResponseHelper.success(result);
  } catch (error) {
    console.error('Ingestion trigger error:', error);
    return ResponseHelper.error(error);
  }
};
