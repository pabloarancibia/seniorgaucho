-- CreateTable
CREATE TABLE "practice_chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "topic_slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "provider_key" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" DATETIME NOT NULL,
    CONSTRAINT "practice_chat_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "practice_chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "provider_blocks_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "practice_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "practice_chat_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "practice_chat_sessions_lesson_id_topic_slug_status_idx" ON "practice_chat_sessions"("lesson_id", "topic_slug", "status");

-- CreateIndex
CREATE INDEX "practice_chat_messages_session_id_created_at_idx" ON "practice_chat_messages"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "practice_chat_messages_session_id_sequence_key" ON "practice_chat_messages"("session_id", "sequence");
