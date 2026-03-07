import { PokemonModel } from '../../shared/models/pokemon-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { optionalAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /pokemon - List all Pokemon with pagination and filters
 */
export const handler = async (event) => {
  try {
    // Optional auth - public endpoint
    await optionalAuth(event);

    const { page, limit, type, search } = event.queryStringParameters || {};

    const pokemonModel = new PokemonModel();
    const result = await pokemonModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
      search,
    });

    return ResponseHelper.paginated(result.pokemon, result.pagination);
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
