import { IngestionService } from '../../shared/services/ingestion-service.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';

/**
 * EventBridge Cron - Trigger Pokemon ingestion every 5 minutes
 */
export const handler = async (event) => {
  try {
    const ingestionService = new IngestionService();
    const result = await ingestionService.startIngestion(151);

    console.log(`Ingestion job ${result.jobId} started with ${result.totalRecords} Pokemon`);

    return ResponseHelper.success(result);
  } catch (error) {
    console.error('Ingestion trigger error:', error);
    return ResponseHelper.error(error);
  }
};
