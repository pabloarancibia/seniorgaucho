-- CreateTable
CREATE TABLE "practice_code_snippets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "topic_slug" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code_content" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "practice_code_snippets_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "practice_code_snippets_lesson_id_topic_slug_language_key" ON "practice_code_snippets"("lesson_id", "topic_slug", "language");
