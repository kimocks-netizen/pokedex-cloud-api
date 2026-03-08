import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/error-handler.mjs';
import { ResponseHelper } from '../utils/response-helper.mjs';

/**
 * AuthMiddleware - JWT verification
 */
export const authMiddleware = async (event) => {
  console.log('AuthMiddleware - Starting authentication');
  const token = event.headers?.Authorization || event.headers?.authorization;

  if (!token) {
    console.error('AuthMiddleware - No token provided');
    throw new AuthenticationError('No token provided');
  }

  const bearerToken = token.replace('Bearer ', '');
  console.log('AuthMiddleware - Token found, verifying...');

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    console.log('AuthMiddleware - Token verified successfully:', { userId: decoded.userId, role: decoded.role });
    return decoded;
  } catch (error) {
    console.error('AuthMiddleware - Token verification failed:', error.message);
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const optionalAuth = async (event) => {
  try {
    return await authMiddleware(event);
  } catch {
    console.log('OptionalAuth - No valid token, continuing without auth');
    return null;
  }
};

/**
 * Require authentication and optionally check roles
 */
export const requireAuth = async (event, allowedRoles = []) => {
  console.log('RequireAuth - Starting with allowed roles:', allowedRoles);
  const user = await authMiddleware(event);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.error('RequireAuth - Insufficient permissions. User role:', user.role, 'Allowed:', allowedRoles);
    throw new AuthenticationError('Insufficient permissions');
  }
  
  console.log('RequireAuth - Authorization successful');
  return user;
};
