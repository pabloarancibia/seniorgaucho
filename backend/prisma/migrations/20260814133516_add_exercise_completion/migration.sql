-- CreateTable
CREATE TABLE "exercise_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lesson_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercise_completions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_completions_lesson_id_exercise_id_key" ON "exercise_completions"("lesson_id", "exercise_id");
