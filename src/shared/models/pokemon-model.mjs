import { getPrismaClient } from '../config/database.mjs';

/**
 * PokemonModel - Data access layer for Pokemon
 */
export class PokemonModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async findAll({ page = 1, limit = 20, type = null, search = null }) {
    const skip = (page - 1) * limit;
    
    const where = {
      deletedAt: null,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
      ...(type && {
        types: {
          some: {
            typeName: type,
          },
        },
      }),
    };

    const [pokemon, total] = await Promise.all([
      this.prisma.pokemon.findMany({
        where,
        include: {
          types: true,
          stats: true,
          abilities: true,
        },
        orderBy: {
          powerScore: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.pokemon.count({ where }),
    ]);

    return {
      pokemon,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return this.prisma.pokemon.findUnique({
      where: { id: parseInt(id) },
      include: {
        types: true,
        stats: true,
        abilities: true,
      },
    });
  }

  async upsert(pokemonData) {
    const { id, name, height, weight, baseExperience, spriteUrl, types, stats, abilities } = pokemonData;

    return this.prisma.pokemon.upsert({
      where: { id },
      update: {
        name,
        height,
        weight,
        baseExperience,
        spriteUrl,
        updatedAt: new Date(),
      },
      create: {
        id,
        name,
        height,
        weight,
        baseExperience,
        spriteUrl,
        types: {
          create: types,
        },
        stats: {
          create: stats,
        },
        abilities: {
          create: abilities,
        },
      },
    });
  }
}
