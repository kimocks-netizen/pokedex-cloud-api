import { getPrismaClient } from '../config/database.mjs';

/**
 * CleanupService - Clean up old and deleted records
 */
export class CleanupService {
  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Delete soft-deleted Pokemon and their related records
   */
  async cleanupDeletedPokemon() {
    const deletedPokemon = await this.prisma.pokemon.findMany({
      where: {
        deletedAt: { not: null }
      },
      select: { id: true, name: true }
    });

    if (deletedPokemon.length === 0) {
      return { deletedPokemon: 0 };
    }

    // Delete related records (cascade will handle this, but being explicit)
    const pokemonIds = deletedPokemon.map(p => p.id);
    
    await this.prisma.pokemon.deleteMany({
      where: { id: { in: pokemonIds } }
    });

    return {
      deletedPokemon: deletedPokemon.length,
      pokemonNames: deletedPokemon.map(p => p.name)
    };
  }

  /**
   * Delete old ingestion jobs (older than 30 days)
   */
  async cleanupOldJobs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.ingestionJob.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ['completed', 'failed'] }
      }
    });

    return { deletedJobs: result.count };
  }

  /**
   * Delete old failed messages (resolved or older than 30 days)
   */
  async cleanupOldFailedMessages() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.failedMessage.deleteMany({
      where: {
        OR: [
          { status: 'resolved' },
          { createdAt: { lt: thirtyDaysAgo } }
        ]
      }
    });

    return { deletedMessages: result.count };
  }

  /**
   * Run all cleanup tasks
   */
  async runFullCleanup() {
    const results = {
      startedAt: new Date(),
      tasks: {}
    };

    try {
      results.tasks.pokemon = await this.cleanupDeletedPokemon();
      results.tasks.jobs = await this.cleanupOldJobs();
      results.tasks.failedMessages = await this.cleanupOldFailedMessages();
      
      results.completedAt = new Date();
      results.success = true;
      results.summary = {
        totalDeleted: 
          results.tasks.pokemon.deletedPokemon +
          results.tasks.jobs.deletedJobs +
          results.tasks.failedMessages.deletedMessages
      };
    } catch (error) {
      results.completedAt = new Date();
      results.success = false;
      results.error = error.message;
    }

    return results;
  }
}
