import { Client } from '@opensearch-project/opensearch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://pokedex_admin:PokedexSecure2025!@pokedex-db-dev.cpymmig2yajk.af-south-1.rds.amazonaws.com:5432/pokedex'
    }
  }
});

const client = new Client({
  node: process.env.OPENSEARCH_URL || 'http://localhost:9200'
});

async function syncPokemonToOpenSearch() {
  console.log('Fetching Pokemon from database...');
  
  const pokemon = await prisma.pokemon.findMany({
    include: {
      types: true,
      stats: true,
      abilities: true
    }
  });

  console.log(`Found ${pokemon.length} Pokemon to index`);

  // Create index if not exists
  const indexExists = await client.indices.exists({ index: 'pokemon' });
  
  if (!indexExists.body) {
    await client.indices.create({
      index: 'pokemon',
      body: {
        mappings: {
          properties: {
            id: { type: 'integer' },
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            height: { type: 'integer' },
            weight: { type: 'integer' },
            baseExperience: { type: 'integer' },
            spriteUrl: { type: 'keyword' },
            powerScore: { type: 'float' },
            types: { type: 'keyword' },
            hp: { type: 'integer' },
            attack: { type: 'integer' },
            defense: { type: 'integer' },
            speed: { type: 'integer' }
          }
        }
      }
    });
    console.log('Created pokemon index');
  }

  // Bulk index Pokemon
  const body = pokemon.flatMap(p => {
    const stats = p.stats.reduce((acc, stat) => {
      acc[stat.statName.replace('-', '')] = stat.baseStat;
      return acc;
    }, {});

    return [
      { index: { _index: 'pokemon', _id: p.id.toString() } },
      {
        id: p.id,
        name: p.name,
        height: p.height,
        weight: p.weight,
        baseExperience: p.baseExperience,
        spriteUrl: p.spriteUrl,
        powerScore: parseFloat(p.powerScore?.toString() || '0'),
        types: p.types.map(t => t.typeName),
        hp: stats.hp || 0,
        attack: stats.attack || 0,
        defense: stats.defense || 0,
        speed: stats.speed || 0
      }
    ];
  });

  const result = await client.bulk({ body });
  
  if (result.body.errors) {
    console.error('Bulk indexing had errors');
  } else {
    console.log(`Successfully indexed ${pokemon.length} Pokemon`);
  }

  await prisma.$disconnect();
}

syncPokemonToOpenSearch().catch(console.error);
