-- AlterTable
ALTER TABLE "ingestion_jobs" ADD COLUMN     "source" VARCHAR(50) NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE INDEX "ingestion_jobs_source_idx" ON "ingestion_jobs"("source");
