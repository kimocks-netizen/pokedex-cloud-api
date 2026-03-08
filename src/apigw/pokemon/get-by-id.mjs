import { PokemonModel } from '../../shared/models/pokemon-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { NotFoundError } from '../../shared/utils/error-handler.mjs';
import { optionalAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * GET /pokemon/{id} - Get Pokemon by ID
 */
export const handler = async (event) => {
  try {
    await optionalAuth(event);

    const { id } = event.pathParameters || {};
    
    if (!id) {
      return ResponseHelper.badRequest('Pokemon ID is required');
    }

    const pokemonModel = new PokemonModel();
    const pokemon = await pokemonModel.findById(id);

    if (!pokemon) {
      throw new NotFoundError(`Pokemon with ID ${id} not found`);
    }

    return ResponseHelper.success(pokemon);
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
