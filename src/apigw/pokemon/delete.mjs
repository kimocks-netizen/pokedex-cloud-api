import { PokemonModel } from '../../shared/models/pokemon-model.mjs';
import { ResponseHelper } from '../../shared/utils/response-helper.mjs';
import { requireAuth } from '../../shared/middleware/auth-middleware.mjs';

/**
 * DELETE /pokemon - Delete Pokemon by IDs (admin only)
 */
export const handler = async (event) => {
  try {
    await requireAuth(event, ['admin']);

    const body = JSON.parse(event.body || '{}');
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return ResponseHelper.badRequest('ids array is required and must not be empty');
    }

    const pokemonModel = new PokemonModel();
    const count = await pokemonModel.deleteByIds(ids);

    return ResponseHelper.success({
      message: `Successfully deleted ${count} Pokemon records`,
      count,
    });
  } catch (error) {
    return ResponseHelper.error(error);
  }
};
