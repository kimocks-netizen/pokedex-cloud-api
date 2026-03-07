-- CreateTable
CREATE TABLE "pokemon" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "base_experience" INTEGER,
    "sprite_url" TEXT,
    "power_score" DECIMAL(6,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_types" (
    "id" SERIAL NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_stats" (
    "id" SERIAL NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "stat_name" VARCHAR(50) NOT NULL,
    "base_stat" INTEGER NOT NULL,
    "effort" INTEGER NOT NULL,

    CONSTRAINT "pokemon_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_abilities" (
    "id" SERIAL NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "ability_name" VARCHAR(100) NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "pokemon_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_jobs" (
    "id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "processed_records" INTEGER NOT NULL DEFAULT 0,
    "failed_records" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingestion_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "websocket_connections" (
    "connection_id" VARCHAR(255) NOT NULL,
    "user_id" UUID,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "websocket_connections_pkey" PRIMARY KEY ("connection_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_name_key" ON "pokemon"("name");

-- CreateIndex
CREATE INDEX "pokemon_power_score_idx" ON "pokemon"("power_score");

-- CreateIndex
CREATE INDEX "pokemon_name_idx" ON "pokemon"("name");

-- CreateIndex
CREATE INDEX "pokemon_types_type_name_idx" ON "pokemon_types"("type_name");

-- CreateIndex
CREATE INDEX "pokemon_types_pokemon_id_idx" ON "pokemon_types"("pokemon_id");

-- CreateIndex
CREATE INDEX "pokemon_stats_pokemon_id_idx" ON "pokemon_stats"("pokemon_id");

-- CreateIndex
CREATE INDEX "pokemon_abilities_pokemon_id_idx" ON "pokemon_abilities"("pokemon_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_users_username_key" ON "api_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "api_users_email_key" ON "api_users"("email");

-- CreateIndex
CREATE INDEX "ingestion_jobs_status_idx" ON "ingestion_jobs"("status");

-- CreateIndex
CREATE INDEX "ingestion_jobs_created_at_idx" ON "ingestion_jobs"("created_at");

-- CreateIndex
CREATE INDEX "websocket_connections_user_id_idx" ON "websocket_connections"("user_id");

-- AddForeignKey
ALTER TABLE "pokemon_types" ADD CONSTRAINT "pokemon_types_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_stats" ADD CONSTRAINT "pokemon_stats_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
