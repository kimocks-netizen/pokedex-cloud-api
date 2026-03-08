import { getPrismaClient } from '../config/database.mjs';

export class IngestionJobModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async findAll({ page = 1, limit = 20 }) {
    try {
      console.log('IngestionJobModel.findAll - Starting query with:', { page, limit });
      const skip = (page - 1) * limit;

      const [jobs, total] = await Promise.all([
        this.prisma.ingestionJob.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.ingestionJob.count(),
      ]);

      console.log('IngestionJobModel.findAll - Query successful:', { jobsCount: jobs.length, total });
      
      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('IngestionJobModel.findAll - Error:', error);
      throw error;
    }
  }

  async findById(id) {
    return this.prisma.ingestionJob.findUnique({
      where: { id },
    });
  }
}
