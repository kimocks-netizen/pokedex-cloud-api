import { getPrismaClient } from '../config/database.mjs';

/**
 * FailedMessageModel - Data access layer for DLQ messages
 */
export class FailedMessageModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(messageData) {
    return this.prisma.failedMessage.create({
      data: messageData,
    });
  }

  async findAll({ page = 1, limit = 20, status = null }) {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(status && { status }),
    };

    const [messages, total] = await Promise.all([
      this.prisma.failedMessage.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.failedMessage.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return this.prisma.failedMessage.findUnique({
      where: { id },
    });
  }

  async updateStatus(id, status, errorMessage = null) {
    return this.prisma.failedMessage.update({
      where: { id },
      data: {
        status,
        ...(errorMessage && { errorMessage }),
        ...(status === 'retrying' && { 
          lastRetryAt: new Date(),
          retryCount: { increment: 1 },
        }),
        ...(status === 'resolved' && { resolvedAt: new Date() }),
      },
    });
  }

  async getStats() {
    const [total, pending, retrying, failed, resolved] = await Promise.all([
      this.prisma.failedMessage.count(),
      this.prisma.failedMessage.count({ where: { status: 'pending' } }),
      this.prisma.failedMessage.count({ where: { status: 'retrying' } }),
      this.prisma.failedMessage.count({ where: { status: 'failed' } }),
      this.prisma.failedMessage.count({ where: { status: 'resolved' } }),
    ]);

    return { total, pending, retrying, failed, resolved };
  }
}
