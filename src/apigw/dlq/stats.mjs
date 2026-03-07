import { FailedMessageModel } from '../../shared/models/failed-message-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /dlq/stats - Get DLQ statistics
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    if (user.role !== 'admin') {
      return ResponseHelper.forbidden('Admin access required');
    }

    const messageModel = new FailedMessageModel();
    const stats = await messageModel.getStats();

    return ResponseHelper.success(stats);
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('DLQ stats error:', error);
    return ResponseHelper.error(error);
  }
};
