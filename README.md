# PokeDex Cloud API

Serverless Pokemon API built with AWS Lambda, API Gateway, SQS, and PostgreSQL.

## Architecture

**Runtime:** Node.js 20.x  
**Database:** PostgreSQL (RDS) + Prisma ORM  
**Queue:** AWS SQS  
**Deployment:** AWS SAM (CloudFormation)  
**Authentication:** JWT  
**Region:** af-south-1 (Cape Town)

## Structure

```
src/
├── apigw/              # API Gateway Lambda handlers
│   ├── auth/          # Authentication endpoints
│   ├── pokemon/       # Pokemon CRUD
│   ├── health/        # Health check
│   └── ingestion/     # Ingestion triggers
├── cron/              # Background workers
│   └── pokemon-worker.mjs
└── shared/            # Business logic
    ├── models/        # Data access (Prisma)
    ├── services/      # Business services
    ├── middleware/    # Auth, error handling
    └── utils/         # Helpers
```

## Setup

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET, SQS_QUEUE_URL
npx prisma generate
npx prisma migrate deploy
```

## Local Development

```bash
# Start local API Gateway
sam local start-api

# Invoke specific function
sam local invoke HealthCheckFunction -e events/health-check.json
```

## Deployment

```bash
# Build
sam build

# Deploy to AWS
sam deploy --guided

# Or use npm scripts
npm run deploy:dev
```

## API Endpoints

```
POST   /auth/login          # Authenticate
POST   /auth/register       # Create account
GET    /pokemon             # List (paginated)
GET    /pokemon/{id}        # Get by ID
GET    /health              # Health check
POST   /ingestion/trigger   # Manual ingestion (protected)
```

## Database

**Schema:** `prisma/schema.prisma`

```bash
npx prisma migrate dev      # Create migration
npx prisma migrate deploy   # Apply to production
npx prisma studio           # GUI explorer
npx prisma generate         # Regenerate client
```

## AWS Resources

- 7 Lambda Functions (auth, pokemon, health, ingestion, worker)
- API Gateway REST API
- 2 SQS Queues (main + DLQ)
- 2 Secrets Manager secrets (DB URL, JWT)
- EventBridge cron rule (disabled by default)
- CloudWatch Log Groups

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/pokedex
JWT_SECRET=your-secret-key
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account/queue-name
```

## Testing

```bash
npm test                    # All tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
```

## Security

- JWT authentication with httpOnly cookies
- Secrets stored in AWS Secrets Manager
- IAM roles with least privilege
- VPC integration for RDS (optional)
- API Gateway throttling

## Cost

**Development:** ~$13-15/month  
**Production (moderate):** ~$14-19/month

See [AWS_COSTS.md](../../docs/AWS_COSTS.md) for details.

## Related

- [Frontend UI](../pokedex-cloud-ui)
- [Documentation](../../docs)
- [Deployment Outputs](./DEPLOYMENT_OUTPUTS.md)
