import { prisma } from "@infrastructure/persistence/prisma/client.js";
import { PrismaLessonRepository } from "@infrastructure/persistence/prisma/repositories/PrismaLessonRepository.js";
import { PrismaProgressRepository } from "@infrastructure/persistence/prisma/repositories/PrismaProgressRepository.js";
import { PrismaCodeSnippetRepository } from "@infrastructure/persistence/prisma/repositories/PrismaCodeSnippetRepository.js";
import { PrismaQuizAnswerRepository } from "@infrastructure/persistence/prisma/repositories/PrismaQuizAnswerRepository.js";
import { PrismaExerciseCompletionRepository } from "@infrastructure/persistence/prisma/repositories/PrismaExerciseCompletionRepository.js";
import { PrismaPracticeCodeSnippetRepository } from "@infrastructure/persistence/prisma/repositories/PrismaPracticeCodeSnippetRepository.js";
import { PrismaPracticeChatSessionRepository } from "@infrastructure/persistence/prisma/repositories/PrismaPracticeChatSessionRepository.js";
import { PrismaPracticeChatMessageRepository } from "@infrastructure/persistence/prisma/repositories/PrismaPracticeChatMessageRepository.js";

import { env } from "@infrastructure/config/env.js";
import type { LlmProvider, LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";
import { LlmProviderRegistry } from "@infrastructure/llm/LlmProviderRegistry.js";
import { FakeLlmProvider } from "@infrastructure/llm/fake/FakeLlmProvider.js";
import { AnthropicLlmProvider } from "@infrastructure/llm/anthropic/AnthropicLlmProvider.js";
import { GoogleLlmProvider } from "@infrastructure/llm/google/GoogleLlmProvider.js";

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
import { SubmitExerciseCompletionUseCase } from "@application/exercise-completion/use-cases/SubmitExerciseCompletionUseCase.js";
import { ListExerciseCompletionsUseCase } from "@application/exercise-completion/use-cases/ListExerciseCompletionsUseCase.js";
import { SavePracticeCodeSnippetUseCase } from "@application/practice-code-snippet/use-cases/SavePracticeCodeSnippetUseCase.js";
import { GetPracticeCodeSnippetUseCase } from "@application/practice-code-snippet/use-cases/GetPracticeCodeSnippetUseCase.js";
import { StartPracticeChatSessionUseCase } from "@application/practice-tutor/use-cases/StartPracticeChatSessionUseCase.js";
import { GetPracticeChatSessionUseCase } from "@application/practice-tutor/use-cases/GetPracticeChatSessionUseCase.js";
import { SendPracticeChatMessageUseCase } from "@application/practice-tutor/use-cases/SendPracticeChatMessageUseCase.js";

import { LessonController } from "@infrastructure/http/controllers/LessonController.js";
import { ProgressController } from "@infrastructure/http/controllers/ProgressController.js";
import { CodeSnippetController } from "@infrastructure/http/controllers/CodeSnippetController.js";
import { QuizAnswerController } from "@infrastructure/http/controllers/QuizAnswerController.js";
import { ExerciseCompletionController } from "@infrastructure/http/controllers/ExerciseCompletionController.js";
import { PracticeCodeSnippetController } from "@infrastructure/http/controllers/PracticeCodeSnippetController.js";
import { LlmProviderController } from "@infrastructure/http/controllers/LlmProviderController.js";
import { PracticeChatSessionController } from "@infrastructure/http/controllers/PracticeChatSessionController.js";

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
  const exerciseCompletionRepository = new PrismaExerciseCompletionRepository(prisma);
  const practiceCodeSnippetRepository = new PrismaPracticeCodeSnippetRepository(prisma);
  const practiceChatSessionRepository = new PrismaPracticeChatSessionRepository(prisma);
  const practiceChatMessageRepository = new PrismaPracticeChatMessageRepository(prisma);

  // "fake" siempre está registrado (sin costo, sin API key); anthropic/google
  // solo si su API key está configurada — agregar un proveedor nuevo es una
  // clase adapter más acá, cero cambios en el resto del código.
  const llmProviders = new Map<LlmProviderKey, LlmProvider>([["fake", new FakeLlmProvider()]]);
  if (env.ANTHROPIC_API_KEY) {
    llmProviders.set("anthropic", new AnthropicLlmProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL));
  }
  if (env.GOOGLE_API_KEY) {
    llmProviders.set("google", new GoogleLlmProvider(env.GOOGLE_API_KEY, env.GEMINI_MODEL));
  }
  const llmProviderRegistry = new LlmProviderRegistry(llmProviders, env.LLM_PROVIDER);

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

  const submitExerciseCompletionUseCase = new SubmitExerciseCompletionUseCase(
    exerciseCompletionRepository,
    lessonRepository
  );
  const listExerciseCompletionsUseCase = new ListExerciseCompletionsUseCase(exerciseCompletionRepository);

  const savePracticeCodeSnippetUseCase = new SavePracticeCodeSnippetUseCase(
    practiceCodeSnippetRepository,
    lessonRepository
  );
  const getPracticeCodeSnippetUseCase = new GetPracticeCodeSnippetUseCase(practiceCodeSnippetRepository);

  const startPracticeChatSessionUseCase = new StartPracticeChatSessionUseCase(
    practiceChatSessionRepository,
    lessonRepository,
    llmProviderRegistry
  );
  const getPracticeChatSessionUseCase = new GetPracticeChatSessionUseCase(
    practiceChatSessionRepository,
    practiceChatMessageRepository
  );
  const sendPracticeChatMessageUseCase = new SendPracticeChatMessageUseCase(
    practiceChatSessionRepository,
    practiceChatMessageRepository,
    lessonRepository,
    llmProviderRegistry
  );

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
    exerciseCompletionController: new ExerciseCompletionController(
      submitExerciseCompletionUseCase,
      listExerciseCompletionsUseCase
    ),
    practiceCodeSnippetController: new PracticeCodeSnippetController(
      savePracticeCodeSnippetUseCase,
      getPracticeCodeSnippetUseCase
    ),
    llmProviderController: new LlmProviderController(llmProviderRegistry),
    practiceChatSessionController: new PracticeChatSessionController(
      startPracticeChatSessionUseCase,
      getPracticeChatSessionUseCase,
      sendPracticeChatMessageUseCase
    ),
  };
}

export type Container = ReturnType<typeof buildContainer>;
