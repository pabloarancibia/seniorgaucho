/*
  Warnings:

  - Added the required column `exercise_id` to the `practice_code_snippets` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_practice_code_snippets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "topic_slug" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code_content" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "practice_code_snippets_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_practice_code_snippets" ("code_content", "id", "language", "lesson_id", "topic_slug", "updated_at") SELECT "code_content", "id", "language", "lesson_id", "topic_slug", "updated_at" FROM "practice_code_snippets";
DROP TABLE "practice_code_snippets";
ALTER TABLE "new_practice_code_snippets" RENAME TO "practice_code_snippets";
CREATE UNIQUE INDEX "practice_code_snippets_lesson_id_topic_slug_exercise_id_language_key" ON "practice_code_snippets"("lesson_id", "topic_slug", "exercise_id", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
