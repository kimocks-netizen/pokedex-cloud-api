-- CreateTable
CREATE TABLE "scheduled_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_type" VARCHAR(50) NOT NULL,
    "schedule" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_messages" (
    "id" UUID NOT NULL,
    "message_id" VARCHAR(255),
    "message_body" TEXT NOT NULL,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "received_at" TIMESTAMP(3) NOT NULL,
    "last_retry_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_jobs_user_id_idx" ON "scheduled_jobs"("user_id");

-- CreateIndex
CREATE INDEX "scheduled_jobs_enabled_idx" ON "scheduled_jobs"("enabled");

-- CreateIndex
CREATE INDEX "failed_messages_status_idx" ON "failed_messages"("status");

-- CreateIndex
CREATE INDEX "failed_messages_received_at_idx" ON "failed_messages"("received_at");
