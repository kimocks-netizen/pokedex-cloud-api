import { PokemonModel } from '../../shared/models/pokemon-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { requireAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * DELETE /pokemon/all - Delete all Pokemon (admin only)
 */
export const handler = async (event) => {
  try {
    await requireAuth(event, ['admin']);

    const pokemonModel = new PokemonModel();
    const count = await pokemonModel.deleteAll();

    return ResponseHelper.success({
      message: `Successfully deleted ${count} Pokemon records`,
      count,
    });
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
