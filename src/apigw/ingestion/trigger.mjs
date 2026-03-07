import { IngestionService } from '../../shared/services/ingestion-service.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * POST /ingestion/trigger - Manual ingestion trigger
 * Requires admin role
 */
export const handler = async (event) => {
  try {
    // Verify authentication and admin role
    const user = await authMiddleware(event);

    if (user.role !== 'admin') {
      return ResponseHelper.forbidden('Admin access required');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { limit } = body;

    // Validate limit is required
    if (!limit) {
      return ResponseHelper.badRequest('Limit is required');
    }

    // Validate limit range
    if (limit < 1 || limit > 1000) {
      return ResponseHelper.badRequest('Limit must be between 1 and 1000');
    }

    // Start ingestion
    const ingestionService = new IngestionService();
    const result = await ingestionService.startIngestion(limit);

    console.log(`Manual ingestion triggered by ${user.username}: ${result.jobId}`);

    return ResponseHelper.success({
      jobId: result.jobId,
      totalRecords: result.totalRecords,
      message: `Ingestion started for ${result.totalRecords} Pokemon`
    });
  } catch (error) {
    console.error('Manual ingestion trigger error:', error);
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    return ResponseHelper.error(error);
  }
};
