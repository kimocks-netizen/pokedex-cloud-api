import { PokemonModel } from '../../shared/models/pokemon-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { optionalAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /pokemon - List all Pokemon with pagination and filters
 */
export const handler = async (event) => {
  try {
    console.log('Pokemon list - Event:', JSON.stringify(event));
    
    // Optional auth - public endpoint
    await optionalAuth(event);

    const { page, limit, type, search, minPower, maxPower, minHp, maxHp, minAttack, maxAttack, minDefense, maxDefense, minSpeed, maxSpeed, sortBy, sortOrder } = event.queryStringParameters || {};
    console.log('Query params:', { page, limit, type, search, sortBy });

    const pokemonModel = new PokemonModel();
    const result = await pokemonModel.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
      search,
      minPower,
      maxPower,
      minHp,
      maxHp,
      minAttack,
      maxAttack,
      minDefense,
      maxDefense,
      minSpeed,
      maxSpeed,
      sortBy,
      sortOrder,
    });

    console.log('Pokemon result:', { count: result.pokemon.length, total: result.pagination.total });
    return ResponseHelper.paginated(result.pokemon, result.pagination);
  } catch (error) {
    console.error('Error in pokemon list:', error);
    console.error('Error stack:', error.stack);
    return ResponseHelper.error(error);
  }
};
