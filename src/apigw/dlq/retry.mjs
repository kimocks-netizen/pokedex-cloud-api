import { FailedMessageModel } from '../../shared/models/failed-message-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { authMiddleware } from '../../shared/middleware/auth-middleware.mjs';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'af-south-1' });

/**
 * POST /dlq/messages/{id}/retry - Retry a failed message
 */
export const handler = async (event) => {
  try {
    const user = await authMiddleware(event);

    if (user.role !== 'admin') {
      return ResponseHelper.forbidden('Admin access required');
    }

    const messageId = event.pathParameters?.id;
    if (!messageId) {
      return ResponseHelper.badRequest('Message ID is required');
    }

    const messageModel = new FailedMessageModel();
    const message = await messageModel.findById(messageId);

    if (!message) {
      return ResponseHelper.notFound('Message not found');
    }

    if (message.retryCount >= message.maxRetries) {
      return ResponseHelper.badRequest('Maximum retry attempts reached');
    }

    // Send message back to main queue
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: message.messageBody,
    });

    await sqsClient.send(command);
    await messageModel.updateStatus(messageId, 'retrying');

    return ResponseHelper.success({
      message: 'Message sent back to queue for retry',
      messageId,
      retryCount: message.retryCount + 1,
    });
  } catch (error) {
    if (error.name === 'AuthenticationError') {
      return ResponseHelper.unauthorized(error.message);
    }
    console.error('DLQ retry error:', error);
    return ResponseHelper.error(error);
  }
};
