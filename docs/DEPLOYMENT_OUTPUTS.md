# AWS Deployment Outputs

**Stack Name:** pokedex-cloud-api  
**Region:** af-south-1 (Cape Town)  
**Deployed:** 2025-01-22  
**Status:** ✅ Active

---

## API Gateway

**Endpoint URL:**
```
https://1o7s4ez9j2.execute-api.af-south-1.amazonaws.com/Prod
```

**Available Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /pokemon` - List Pokemon with pagination
- `GET /pokemon/{id}` - Get Pokemon by ID
- `GET /health` - Health check

**Test Health Check:**
```bash
curl https://1o7s4ez9j2.execute-api.af-south-1.amazonaws.com/Prod/health
```

---

## SQS Queues

**Main Queue URL:**
```
https://sqs.af-south-1.amazonaws.com/514190630121/pokemon-ingestion-dev
```

**Dead Letter Queue URL:**
```
https://sqs.af-south-1.amazonaws.com/514190630121/pokemon-ingestion-dlq-dev
```

**Queue ARNs:**
- Main: `arn:aws:sqs:af-south-1:514190630121:pokemon-ingestion-dev`
- DLQ: `arn:aws:sqs:af-south-1:514190630121:pokemon-ingestion-dlq-dev`

---

## Lambda Functions

1. **AuthLoginFunction** - User login
2. **AuthRegisterFunction** - User registration
3. **PokemonListFunction** - List Pokemon
4. **PokemonGetByIdFunction** - Get Pokemon by ID
5. **HealthCheckFunction** - Health check
6. **IngestionTriggerFunction** - Trigger ingestion (EventBridge cron - disabled)
7. **PokemonWorkerFunction** - Process SQS messages

---

## Secrets Manager

**Database Secret:**
- Name: `pokedex-db-dev`
- Contains: PostgreSQL connection string

**JWT Secret:**
- Name: `pokedex-jwt-dev`
- Contains: JWT signing key

---

## Environment Variables (Update .env)

```bash
# API Gateway
NEXT_PUBLIC_API_URL=https://1o7s4ez9j2.execute-api.af-south-1.amazonaws.com/Prod

# SQS Queue
SQS_QUEUE_URL=https://sqs.af-south-1.amazonaws.com/514190630121/pokemon-ingestion-dev
SQS_DLQ_URL=https://sqs.af-south-1.amazonaws.com/514190630121/pokemon-ingestion-dlq-dev

# AWS Region
AWS_REGION=af-south-1
```

---

## Next Steps

1. ✅ Create RDS PostgreSQL database
2. ✅ Update Secrets Manager with real database URL
3. ✅ Run Prisma migrations
4. ✅ Test API endpoints
5. ✅ Update frontend .env.local with API URL

---

**Last Updated:** 2025-01-22
