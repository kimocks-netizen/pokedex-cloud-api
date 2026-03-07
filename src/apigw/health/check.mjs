import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';

/**
 * GET /health - Health check endpoint
 */
export const handler = async (event) => {
  try {
    const prisma = getPrismaClient();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return ResponseHelper.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'pokedex-cloud-api',
      database: 'connected',
    });
  } catch (error) {
    return ResponseHelper.error(error, 503);
  }
};
