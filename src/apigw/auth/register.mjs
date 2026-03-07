import bcrypt from 'bcryptjs';
import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { ValidationError, ConflictError } from '../../shared/utils/error-handler.mjs';

/**
 * POST /auth/register - User registration
 */
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, email, password } = body;

    if (!username || !email || !password) {
      throw new ValidationError('Username, email, and password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const prisma = getPrismaClient();

    // Check if user exists
    const existingUser = await prisma.apiUser.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new ConflictError('Username or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.apiUser.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'user',
      },
    });

    return ResponseHelper.success(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
