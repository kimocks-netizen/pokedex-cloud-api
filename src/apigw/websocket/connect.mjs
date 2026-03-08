import { getPrismaClient } from '../../shared/config/database.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const prisma = getPrismaClient();

  try {
    await prisma.webSocketConnection.create({
      data: {
        connectionId,
        connectedAt: new Date(),
      },
    });

    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('WebSocket connect error:', error);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};
