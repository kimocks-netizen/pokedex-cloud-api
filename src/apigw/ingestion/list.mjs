import { IngestionJobModel } from '../../shared/models/ingestion-job-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { requireAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /ingestion/jobs - List ingestion jobs with pagination
 */
export const handler = async (event) => {
  try {
    console.log('Ingestion jobs list - Event:', JSON.stringify(event));
    
    await requireAuth(event, ['admin']);

    const { page, limit } = event.queryStringParameters || {};
    console.log('Query params:', { page, limit });

    const ingestionJobModel = new IngestionJobModel();
    const result = await ingestionJobModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    console.log('Jobs result:', JSON.stringify(result));
    return ResponseHelper.paginated(result.jobs, result.pagination);
  } catch (error) {
    console.error('Error in ingestion jobs list:', error);
    console.error('Error stack:', error.stack);
    return ResponseHelper.error(error);
  }
};
