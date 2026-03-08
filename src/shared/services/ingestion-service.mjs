import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { PokeAPIClient } from './pokeapi-client.mjs';
import { getPrismaClient } from '../config/database.mjs';
import { WebSocketService } from './websocket-service.mjs';

const sqsClient = new SQSClient({});
const wsService = new WebSocketService();

/**
 * IngestionService - Orchestrate Pokemon data ingestion
 */
export class IngestionService {
  constructor() {
    this.pokeApiClient = new PokeAPIClient();
    this.prisma = getPrismaClient();
  }

  async startIngestion(limit, source = 'manual') {
    if (!limit || limit < 1 || limit > 1000) {
      throw new Error('Limit is required and must be between 1 and 1000');
    }
    
    // Get the highest Pokemon ID currently in database
    const maxPokemon = await this.prisma.pokemon.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const startId = maxPokemon ? maxPokemon.id + 1 : 1;
    
    // Create ingestion job
    const job = await this.prisma.ingestionJob.create({
      data: {
        status: 'pending',
        source,
        totalRecords: limit,
        processedRecords: 0,
        failedRecords: 0,
      },
    });

    try {
      // Update job to running
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });

      // Send Pokemon IDs to SQS for processing
      for (let i = 0; i < limit; i++) {
        const pokemonId = startId + i;
        
        await sqsClient.send(new SendMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageBody: JSON.stringify({
            pokemonId,
            jobId: job.id,
          }),
        }));
      }

      return { jobId: job.id, totalRecords: limit };
    } catch (error) {
      // Mark job as failed
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async processPokemon(pokemonId, jobId) {
    try {
      // Fetch Pokemon details
      const rawData = await this.pokeApiClient.getPokemonById(pokemonId);
      
      // Transform data
      const pokemonData = this.pokeApiClient.transformPokemonData(rawData);
      
      // Save to database
      const existingPokemon = await this.prisma.pokemon.findUnique({
        where: { id: pokemonData.id },
      });

      if (existingPokemon) {
        // Delete existing related data
        await this.prisma.$transaction([
          this.prisma.pokemonType.deleteMany({ where: { pokemonId: pokemonData.id } }),
          this.prisma.pokemonStat.deleteMany({ where: { pokemonId: pokemonData.id } }),
          this.prisma.pokemonAbility.deleteMany({ where: { pokemonId: pokemonData.id } }),
        ]);
      }

      await this.prisma.pokemon.upsert({
        where: { id: pokemonData.id },
        update: {
          name: pokemonData.name,
          height: pokemonData.height,
          weight: pokemonData.weight,
          baseExperience: pokemonData.baseExperience,
          spriteUrl: pokemonData.spriteUrl,
          powerScore: pokemonData.powerScore,
          updatedAt: new Date(),
          types: {
            create: pokemonData.types,
          },
          stats: {
            create: pokemonData.stats,
          },
          abilities: {
            create: pokemonData.abilities,
          },
        },
        create: {
          id: pokemonData.id,
          name: pokemonData.name,
          height: pokemonData.height,
          weight: pokemonData.weight,
          baseExperience: pokemonData.baseExperience,
          spriteUrl: pokemonData.spriteUrl,
          powerScore: pokemonData.powerScore,
          types: {
            create: pokemonData.types,
          },
          stats: {
            create: pokemonData.stats,
          },
          abilities: {
            create: pokemonData.abilities,
          },
        },
      });

      // Update job progress
      const job = await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          processedRecords: { increment: 1 },
        },
      });

      console.log(`Job ${jobId}: ${job.processedRecords}/${job.totalRecords} processed, ${job.failedRecords} failed`);

      // Broadcast progress via WebSocket
      await wsService.broadcast({
        type: 'ingestion_progress',
        jobId,
        processed: job.processedRecords,
        total: job.totalRecords,
        failed: job.failedRecords,
        status: 'running',
      });

      // Check if job is complete
      if (job.processedRecords + job.failedRecords >= job.totalRecords) {
        console.log(`Job ${jobId} completed!`);
        await this.prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });
        
        // Broadcast completion
        await wsService.broadcast({
          type: 'ingestion_complete',
          jobId,
          processed: job.processedRecords,
          total: job.totalRecords,
          failed: job.failedRecords,
          status: 'completed',
        });
      }

      return { success: true, pokemonId };
    } catch (error) {
      // Update failed records count
      const job = await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          failedRecords: { increment: 1 },
        },
      });

      // Check if job is complete (even with failures)
      if (job.processedRecords + job.failedRecords >= job.totalRecords) {
        await this.prisma.ingestionJob.update({
          where: { id: jobId },
          data: {
            status: job.failedRecords === job.totalRecords ? 'failed' : 'completed',
            completedAt: new Date(),
          },
        });
      }

      throw error;
    }
  }

  async getJobStatus(jobId) {
    return this.prisma.ingestionJob.findUnique({
      where: { id: jobId },
    });
  }
}
