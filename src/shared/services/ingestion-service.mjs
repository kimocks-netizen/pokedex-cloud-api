import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { PokeAPIClient } from './pokeapi-client.mjs';
import { getPrismaClient } from '../config/database.mjs';

const sqsClient = new SQSClient({});

/**
 * IngestionService - Orchestrate Pokemon data ingestion
 */
export class IngestionService {
  constructor() {
    this.pokeApiClient = new PokeAPIClient();
    this.prisma = getPrismaClient();
  }

  async startIngestion(limit) {
    if (!limit || limit < 1 || limit > 1000) {
      throw new Error('Limit is required and must be between 1 and 1000');
    }
    // Create ingestion job
    const job = await this.prisma.ingestionJob.create({
      data: {
        status: 'pending',
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
      },
    });

    try {
      // Fetch Pokemon list
      const pokemonList = await this.pokeApiClient.getPokemonList(limit);
      
      // Update job with total records
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'running',
          totalRecords: pokemonList.results.length,
          startedAt: new Date(),
        },
      });

      // Send each Pokemon to SQS for processing
      for (const pokemon of pokemonList.results) {
        const pokemonId = pokemon.url.split('/').filter(Boolean).pop();
        
        await sqsClient.send(new SendMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageBody: JSON.stringify({
            pokemonId: parseInt(pokemonId),
            jobId: job.id,
            pokemonUrl: pokemon.url,
          }),
        }));
      }

      return { jobId: job.id, totalRecords: pokemonList.results.length };
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
      await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          processedRecords: { increment: 1 },
        },
      });

      return { success: true, pokemonId };
    } catch (error) {
      // Update failed records count
      await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          failedRecords: { increment: 1 },
        },
      });
      throw error;
    }
  }

  async getJobStatus(jobId) {
    return this.prisma.ingestionJob.findUnique({
      where: { id: jobId },
    });
  }
}
