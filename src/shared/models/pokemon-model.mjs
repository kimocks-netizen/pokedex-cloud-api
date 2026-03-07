import { getPrismaClient } from '../config/database.mjs';

/**
 * PokemonModel - Data access layer for Pokemon
 */
export class PokemonModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async findAll({ page = 1, limit = 20, type = null, search = null, minPower = null, maxPower = null, sortBy = 'powerScore', sortOrder = 'desc' }) {
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
      ...((minPower || maxPower) && {
        powerScore: {
          ...(minPower && { gte: parseFloat(minPower) }),
          ...(maxPower && { lte: parseFloat(maxPower) }),
        },
      }),
    };

    // Validate sort field
    const validSortFields = ['powerScore', 'name', 'height', 'weight', 'baseExperience', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'powerScore';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [pokemon, total] = await Promise.all([
      this.prisma.pokemon.findMany({
        where,
        include: {
          types: true,
          stats: true,
          abilities: true,
        },
        orderBy: {
          [orderByField]: orderByDirection,
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
      filters: {
        type,
        search,
        minPower,
        maxPower,
        sortBy: orderByField,
        sortOrder: orderByDirection,
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
