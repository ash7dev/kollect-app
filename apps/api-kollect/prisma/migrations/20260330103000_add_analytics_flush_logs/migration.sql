CREATE TABLE "analytics_flush_logs" (
    "key" VARCHAR(255) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_flush_logs_pkey" PRIMARY KEY ("key")
);
