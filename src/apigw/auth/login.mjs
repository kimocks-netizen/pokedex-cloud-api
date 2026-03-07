import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { AuthenticationError, ValidationError } from '../../shared/utils/error-handler.mjs';

/**
 * POST /auth/login - User login
 */
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const prisma = getPrismaClient();
    const user = await prisma.apiUser.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await prisma.apiUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ResponseHelper.success({
      token,
      expiresIn: 604800,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
