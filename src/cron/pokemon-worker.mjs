import { IngestionService } from '../shared/services/ingestion-service.mjs';
import { ResponseHelper } from '../shared/utils/response-helper.mjs';

/**
 * SQS Worker - Process Pokemon ingestion messages
 */
export const handler = async (event) => {
  const ingestionService = new IngestionService();
  
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const { pokemonId, jobId } = message;

      await ingestionService.processPokemon(pokemonId, jobId);

      console.log(`Successfully processed Pokemon ID: ${pokemonId}`);
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  return ResponseHelper.success({ processed: event.Records.length });
};
