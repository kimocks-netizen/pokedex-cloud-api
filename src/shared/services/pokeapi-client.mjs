/**
 * PokeAPI Client - Fetch Pokemon data from PokeAPI
 */
export class PokeAPIClient {
  constructor() {
    this.baseUrl = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
  }

  async getPokemonList(limit = 151, offset = 0) {
    const response = await fetch(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch Pokemon list');
    return response.json();
  }

  async getPokemonById(id) {
    const response = await fetch(`${this.baseUrl}/pokemon/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch Pokemon ${id}`);
    return response.json();
  }

  transformPokemonData(rawData) {
    const stats = rawData.stats || [];
    const powerScore = stats.reduce((sum, stat) => sum + stat.base_stat, 0) / stats.length;

    return {
      id: rawData.id,
      name: rawData.name,
      height: rawData.height,
      weight: rawData.weight,
      baseExperience: rawData.base_experience,
      spriteUrl: rawData.sprites?.front_default,
      powerScore: parseFloat(powerScore.toFixed(2)),
      types: (rawData.types || []).map(t => ({
        typeName: t.type.name,
        slot: t.slot,
      })),
      stats: stats.map(s => ({
        statName: s.stat.name,
        baseStat: s.base_stat,
        effort: s.effort,
      })),
      abilities: (rawData.abilities || []).map(a => ({
        abilityName: a.ability.name,
        isHidden: a.is_hidden,
        slot: a.slot,
      })),
    };
  }
}
