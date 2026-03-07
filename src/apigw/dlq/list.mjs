import { FailedMessageModel } from '../../shared/models/failed-message-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /dlq/messages - List failed messages from DLQ
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    // Only admins can view DLQ
    if (user.role !== 'admin') {
      return ResponseHelper.forbidden('Admin access required');
    }

    const { page, limit, status } = event.queryStringParameters || {};

    const messageModel = new FailedMessageModel();
    const result = await messageModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
    });

    return ResponseHelper.paginated(result.messages, result.pagination);
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('DLQ list error:', error);
    return ResponseHelper.error(error);
  }
};
