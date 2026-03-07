# Quick Start - Database Setup

## Step 1: Install Dependencies

```bash
cd PokeDex/pokedex-cloud-api
npm install
```

## Step 2: Setup PostgreSQL

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb pokedex
```

### Option B: Docker PostgreSQL
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pokedex
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d
```

## Step 3: Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env with your database URL
# For local: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pokedex"
# For Docker: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pokedex"
```

## Step 4: Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Seed database with admin user
npx prisma db seed
```

## Step 5: Verify Setup

```bash
# Open Prisma Studio
npx prisma studio

# Check tables exist
psql -h localhost -U postgres -d pokedex -c "\dt"
```

Expected tables:
- pokemon
- pokemon_types
- pokemon_stats
- pokemon_abilities
- api_users
- ingestion_jobs
- websocket_connections

## Step 6: Test Ingestion (Local)

```bash
# Install SAM CLI
brew install aws-sam-cli

# Start local API
sam local start-api --env-vars env.json

# Trigger ingestion (in another terminal)
curl -X POST http://localhost:3000/ingestion/trigger
```

## Troubleshooting

### Connection refused
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432
```

### Migration errors
```bash
# Reset database
npx prisma migrate reset
```

### Prisma client errors
```bash
# Regenerate client
npx prisma generate
```

## Next Steps

After database is setup:
1. Test Lambda functions locally
2. Deploy to AWS
3. Run ingestion to populate data
4. Test API endpoints
