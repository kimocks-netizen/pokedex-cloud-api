import { getPrismaClient } from '../../shared/config/database.mjs';

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const prisma = getPrismaClient();

  try {
    await prisma.webSocketConnection.delete({
      where: { connectionId },
    });

    return { statusCode: 200, body: 'Disconnected' };
  } catch (error) {
    console.error('WebSocket disconnect error:', error);
    return { statusCode: 500, body: 'Failed to disconnect' };
  }
};
