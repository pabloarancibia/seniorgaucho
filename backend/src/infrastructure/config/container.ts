import { prisma } from "@infrastructure/persistence/prisma/client.js";
import { PrismaLessonRepository } from "@infrastructure/persistence/prisma/repositories/PrismaLessonRepository.js";
import { PrismaProgressRepository } from "@infrastructure/persistence/prisma/repositories/PrismaProgressRepository.js";
import { PrismaCodeSnippetRepository } from "@infrastructure/persistence/prisma/repositories/PrismaCodeSnippetRepository.js";
import { PrismaQuizAnswerRepository } from "@infrastructure/persistence/prisma/repositories/PrismaQuizAnswerRepository.js";

import { CreateLessonUseCase } from "@application/lesson/use-cases/CreateLessonUseCase.js";
import { ListLessonsUseCase } from "@application/lesson/use-cases/ListLessonsUseCase.js";
import { GetLessonBySlugUseCase } from "@application/lesson/use-cases/GetLessonBySlugUseCase.js";
import { UpdateLessonUseCase } from "@application/lesson/use-cases/UpdateLessonUseCase.js";
import { UpsertProgressUseCase } from "@application/progress/use-cases/UpsertProgressUseCase.js";
import { GetProgressUseCase } from "@application/progress/use-cases/GetProgressUseCase.js";
import { SaveCodeSnippetUseCase } from "@application/code-snippet/use-cases/SaveCodeSnippetUseCase.js";
import { GetCodeSnippetUseCase } from "@application/code-snippet/use-cases/GetCodeSnippetUseCase.js";
import { SubmitQuizAnswerUseCase } from "@application/quiz-answer/use-cases/SubmitQuizAnswerUseCase.js";
import { ListQuizAnswersUseCase } from "@application/quiz-answer/use-cases/ListQuizAnswersUseCase.js";

import { LessonController } from "@infrastructure/http/controllers/LessonController.js";
import { ProgressController } from "@infrastructure/http/controllers/ProgressController.js";
import { CodeSnippetController } from "@infrastructure/http/controllers/CodeSnippetController.js";
import { QuizAnswerController } from "@infrastructure/http/controllers/QuizAnswerController.js";

/**
 * Composition root: cablea adaptadores concretos (Prisma) a los puertos del
 * dominio, arma los casos de uso sobre esos puertos, y expone los
 * controllers listos para montarse en las rutas. Es DI manual a propósito
 * (sin framework de inyección) para que las dependencias sean explícitas.
 */
export function buildContainer() {
  const lessonRepository = new PrismaLessonRepository(prisma);
  const progressRepository = new PrismaProgressRepository(prisma);
  const codeSnippetRepository = new PrismaCodeSnippetRepository(prisma);
  const quizAnswerRepository = new PrismaQuizAnswerRepository(prisma);

  const createLessonUseCase = new CreateLessonUseCase(lessonRepository);
  const listLessonsUseCase = new ListLessonsUseCase(lessonRepository);
  const getLessonBySlugUseCase = new GetLessonBySlugUseCase(lessonRepository);
  const updateLessonUseCase = new UpdateLessonUseCase(lessonRepository);

  const upsertProgressUseCase = new UpsertProgressUseCase(progressRepository, lessonRepository);
  const getProgressUseCase = new GetProgressUseCase(progressRepository);

  const saveCodeSnippetUseCase = new SaveCodeSnippetUseCase(codeSnippetRepository, lessonRepository);
  const getCodeSnippetUseCase = new GetCodeSnippetUseCase(codeSnippetRepository);

  const submitQuizAnswerUseCase = new SubmitQuizAnswerUseCase(quizAnswerRepository, lessonRepository);
  const listQuizAnswersUseCase = new ListQuizAnswersUseCase(quizAnswerRepository);

  return {
    lessonController: new LessonController(
      createLessonUseCase,
      listLessonsUseCase,
      getLessonBySlugUseCase,
      updateLessonUseCase
    ),
    progressController: new ProgressController(upsertProgressUseCase, getProgressUseCase),
    codeSnippetController: new CodeSnippetController(saveCodeSnippetUseCase, getCodeSnippetUseCase),
    quizAnswerController: new QuizAnswerController(submitQuizAnswerUseCase, listQuizAnswersUseCase),
  };
}

export type Container = ReturnType<typeof buildContainer>;
