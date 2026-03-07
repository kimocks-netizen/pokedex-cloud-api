import { getPrismaClient } from '../config/database.mjs';

/**
 * ScheduledJobModel - Data access layer for scheduled jobs
 */
export class ScheduledJobModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(jobData) {
    return this.prisma.scheduledJob.create({
      data: jobData,
    });
  }

  async findByUserId(userId) {
    return this.prisma.scheduledJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return this.prisma.scheduledJob.findUnique({
      where: { id },
    });
  }

  async update(id, data) {
    return this.prisma.scheduledJob.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.prisma.scheduledJob.delete({
      where: { id },
    });
  }

  async findEnabledJobs() {
    return this.prisma.scheduledJob.findMany({
      where: {
        enabled: true,
        nextRun: {
          lte: new Date(),
        },
      },
    });
  }
}
