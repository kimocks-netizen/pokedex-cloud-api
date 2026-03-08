# PokeDex Engine - OpenSearch Performance Testing

This folder contains OpenSearch setup and performance testing scripts to compare query speeds between PostgreSQL and OpenSearch.

## Setup

1. Start OpenSearch and OpenSearch Dashboards:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Sync Pokemon data to OpenSearch:
```bash
node sync-opensearch.mjs
```

4. Run performance tests:
```bash
npm test
```

## Services

- **OpenSearch**: http://localhost:9200
- **OpenSearch Dashboards**: http://localhost:5601

## Test Results

The performance test will run 100 iterations of fetching 20 Pokemon records from both PostgreSQL and OpenSearch, then compare:
- Average response time
- Min/Max response times
- Speedup factor

## Cleanup

Stop and remove containers:
```bash
docker-compose down -v
```
