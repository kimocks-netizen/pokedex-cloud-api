import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /users - List all users (admin only)
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    if (user.role !== 'admin') {
      return ResponseHelper.forbidden('Admin access required');
    }

    const prisma = getPrismaClient();
    const users = await prisma.apiUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ResponseHelper.success(users);
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('List users error:', error);
    return ResponseHelper.error(error);
  }
};
