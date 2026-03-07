import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/error-handler.mjs';

/**
 * AuthMiddleware - JWT verification
 */
export const authMiddleware = async (event) => {
  const token = event.headers?.Authorization || event.headers?.authorization;

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  const bearerToken = token.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const optionalAuth = async (event) => {
  try {
    return await authMiddleware(event);
  } catch {
    return null;
  }
};
