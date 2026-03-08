import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { getPrismaClient } from '../config/database.mjs';

export class WebSocketService {
  constructor() {
    this.prisma = getPrismaClient();
    this.apiGateway = null;
  }

  initClient(endpoint) {
    if (!this.apiGateway) {
      this.apiGateway = new ApiGatewayManagementApiClient({
        endpoint,
      });
    }
  }

  async broadcast(message) {
    const connections = await this.prisma.webSocketConnection.findMany();
    
    const endpoint = process.env.WEBSOCKET_ENDPOINT;
    if (!endpoint) {
      console.warn('WEBSOCKET_ENDPOINT not configured');
      return;
    }

    this.initClient(endpoint);

    const promises = connections.map(async (conn) => {
      try {
        await this.apiGateway.send(new PostToConnectionCommand({
          ConnectionId: conn.connectionId,
          Data: JSON.stringify(message),
        }));
      } catch (error) {
        if (error.statusCode === 410) {
          await this.prisma.webSocketConnection.delete({
            where: { connectionId: conn.connectionId },
          });
        }
      }
    });

    await Promise.allSettled(promises);
  }
}
