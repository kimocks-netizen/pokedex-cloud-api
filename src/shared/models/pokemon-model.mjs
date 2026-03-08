import { getPrismaClient } from '../config/database.mjs';

/**
 * PokemonModel - Data access layer for Pokemon
 */
export class PokemonModel {
  constructor() {
    this.prisma = getPrismaClient();
  }

  async findAll({ page = 1, limit = 20, type = null, search = null, minPower = null, maxPower = null, minHp = null, maxHp = null, minAttack = null, maxAttack = null, minDefense = null, maxDefense = null, minSpeed = null, maxSpeed = null, sortBy = 'powerScore', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;
    
    // Build stat filters using AND logic
    const statFilters = [];
    if (minHp || maxHp) {
      statFilters.push({
        stats: {
          some: {
            statName: 'hp',
            baseStat: {
              ...(minHp && { gte: parseInt(minHp) }),
              ...(maxHp && { lte: parseInt(maxHp) }),
            },
          },
        },
      });
    }
    if (minAttack || maxAttack) {
      statFilters.push({
        stats: {
          some: {
            statName: 'attack',
            baseStat: {
              ...(minAttack && { gte: parseInt(minAttack) }),
              ...(maxAttack && { lte: parseInt(maxAttack) }),
            },
          },
        },
      });
    }
    if (minDefense || maxDefense) {
      statFilters.push({
        stats: {
          some: {
            statName: 'defense',
            baseStat: {
              ...(minDefense && { gte: parseInt(minDefense) }),
              ...(maxDefense && { lte: parseInt(maxDefense) }),
            },
          },
        },
      });
    }
    if (minSpeed || maxSpeed) {
      statFilters.push({
        stats: {
          some: {
            statName: 'speed',
            baseStat: {
              ...(minSpeed && { gte: parseInt(minSpeed) }),
              ...(maxSpeed && { lte: parseInt(maxSpeed) }),
            },
          },
        },
      });
    }
    
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
      ...(statFilters.length > 0 && {
        AND: statFilters,
      }),
    };

    // Validate sort field - add stat-based sorting
    const validSortFields = ['powerScore', 'name', 'height', 'weight', 'baseExperience', 'createdAt', 'id'];
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

  async deleteAll() {
    const count = await this.prisma.pokemon.count({ where: { deletedAt: null } });
    
    // Hard delete all Pokemon (CASCADE removes types/stats/abilities)
    await this.prisma.pokemon.deleteMany({
      where: { deletedAt: null },
    });
    
    return count;
  }

  async deleteByIds(ids) {
    const pokemonIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (pokemonIds.length === 0) {
      return 0;
    }

    const count = await this.prisma.pokemon.count({
      where: {
        id: { in: pokemonIds },
        deletedAt: null,
      },
    });
    
    // Hard delete Pokemon and related data (CASCADE)
    await this.prisma.pokemon.deleteMany({
      where: {
        id: { in: pokemonIds },
      },
    });
    
    return count;
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
