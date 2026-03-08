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

async function testPostgres() {
  const iterations = 100;
  const times = [];

  console.log('\n=== Testing PostgreSQL ===');
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    await prisma.pokemon.findMany({
      take: 20,
      skip: 0,
      include: {
        types: true,
        stats: true
      }
    });
    
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
  
  return { avg, min, max };
}

async function testOpenSearch() {
  const iterations = 100;
  const times = [];

  console.log('\n=== Testing OpenSearch ===');
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    await client.search({
      index: 'pokemon',
      body: {
        size: 20,
        from: 0,
        query: { match_all: {} }
      }
    });
    
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
  
  return { avg, min, max };
}

async function runTests() {
  console.log('Starting performance tests...\n');
  
  const pgResults = await testPostgres();
  const osResults = await testOpenSearch();
  
  console.log('\n=== Summary ===');
  console.log(`PostgreSQL avg: ${pgResults.avg.toFixed(2)}ms`);
  console.log(`OpenSearch avg: ${osResults.avg.toFixed(2)}ms`);
  console.log(`Speedup: ${(pgResults.avg / osResults.avg).toFixed(2)}x`);
  
  await prisma.$disconnect();
}

runTests().catch(console.error);
