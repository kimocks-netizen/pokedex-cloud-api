import { Client } from '@opensearch-project/opensearch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://pokedex_admin:PokedexSecure2025!@pokedex-db-dev.cpymmig2yajk.af-south-1.rds.amazonaws.com:5432/postgres?schema=public'
    }
  }
});

const client = new Client({
  node: process.env.OPENSEARCH_URL || 'http://localhost:9200'
});

async function testPostgresAll() {
  console.log('\n=== Testing PostgreSQL (ALL Pokemon) ===');
  
  const start = performance.now();
  
  const pokemon = await prisma.pokemon.findMany({
    include: {
      types: true,
      stats: true
    }
  });
  
  const end = performance.now();
  const time = end - start;

  console.log(`Fetched ${pokemon.length} Pokemon`);
  console.log(`Time: ${time.toFixed(2)}ms`);
  
  return { count: pokemon.length, time };
}

async function testOpenSearchAll() {
  console.log('\n=== Testing OpenSearch (ALL Pokemon) ===');
  
  const start = performance.now();
  
  const result = await client.search({
    index: 'pokemon',
    body: {
      size: 10000,
      query: { match_all: {} }
    }
  });
  
  const end = performance.now();
  const time = end - start;

  console.log(`Fetched ${result.body.hits.hits.length} Pokemon`);
  console.log(`Time: ${time.toFixed(2)}ms`);
  
  return { count: result.body.hits.hits.length, time };
}

async function runComparison() {
  console.log('Starting full dataset comparison...\n');
  
  const pgResults = await testPostgresAll();
  const osResults = await testOpenSearchAll();
  
  console.log('\n=== COMPARISON SUMMARY ===');
  console.log(`PostgreSQL: ${pgResults.time.toFixed(2)}ms (${pgResults.count} records)`);
  console.log(`OpenSearch: ${osResults.time.toFixed(2)}ms (${osResults.count} records)`);
  console.log(`Speedup: ${(pgResults.time / osResults.time).toFixed(2)}x faster with OpenSearch`);
  
  await prisma.$disconnect();
}

runComparison().catch(console.error);
