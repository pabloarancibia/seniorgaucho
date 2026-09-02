import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
import { PracticeScreen } from "@/components/lesson/PracticeScreen";
import {
  extractAllExerciseIds,
  extractExerciseBlocksForTopic,
  extractStarterCodeByExercise,
  extractTopicSlugs,
} from "@/lib/lesson/extractTopicSlugs";

interface PracticePageProps {
  params: Promise<{ slug: string; topicSlug: string }>;
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { slug, topicSlug } = await params;

  const lesson = await api.getLesson(slug).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  const validTopicSlugs = new Set([
    ...extractTopicSlugs(lesson.mdxContent),
    ...(lesson.mdxContentEn ? extractTopicSlugs(lesson.mdxContentEn) : []),
  ]);
  if (!validTopicSlugs.has(topicSlug)) notFound();

  // Se recorta el MDX a solo los <Exercise> del tema ANTES de compilar —
  // no alcanza con filtrar después de compilar (ver comentario en
  // extractExerciseBlocksForTopic): así la pantalla de práctica nunca
  // termina mostrando la prosa teórica que rodea a los ejercicios.
  const exerciseBlocksEs = extractExerciseBlocksForTopic(lesson.mdxContent, topicSlug);
  if (!exerciseBlocksEs) notFound();
  const exerciseBlocksEn = lesson.mdxContentEn
    ? extractExerciseBlocksForTopic(lesson.mdxContentEn, topicSlug)
    : null;

  // El código de arranque/tests es código, no prosa — se busca en ambas
  // fuentes (ES/EN) y se mergea: como el exerciseId sale de slugify(title)
  // y el título SÍ está traducido, el mismo ejercicio puede tener un id
  // distinto en cada locale (ver extractStarterCodeByExercise). Autorar
  // <ExerciseStarter> idéntico en ambas versiones evita el gap.
  const starterCodeByExerciseId = {
    ...extractStarterCodeByExercise(lesson.mdxContent, topicSlug),
    ...(lesson.mdxContentEn ? extractStarterCodeByExercise(lesson.mdxContentEn, topicSlug) : {}),
  };

  // Todos los exerciseId de este tema (con o sin tests) — para el rollup
  // "X/Y ejercicios completados" del panel de edición (ver PracticeScreen).
  // OJO: NO se mergean ES+EN acá — el título SÍ está traducido, así que el
  // MISMO ejercicio tiene un exerciseId distinto en cada locale; un Set
  // unión terminaría contando cada ejercicio dos veces (visto en 0.5: un
  // tema con 8 ejercicios mostraba "16 ejercicios"). Se pasan las dos listas
  // por separado y PracticeCodeEditorPanel elige la del locale actual.
  const topicExerciseIdsEs = extractAllExerciseIds(exerciseBlocksEs);
  const topicExerciseIdsEn = exerciseBlocksEn ? extractAllExerciseIds(exerciseBlocksEn) : [];

  return (
    <PracticeScreen
      lessonId={lesson.id}
      lessonSlug={slug}
      topicSlug={topicSlug}
      starterCodeByExerciseId={starterCodeByExerciseId}
      topicExerciseIdsEs={topicExerciseIdsEs}
      topicExerciseIdsEn={topicExerciseIdsEn}
      statementEs={
        <MdxContent
          source={exerciseBlocksEs}
          lessonId={lesson.id}
          opts={{ mode: "practice", starterCodeByExerciseId }}
        />
      }
      statementEn={
        exerciseBlocksEn ? (
          <MdxContent
            source={exerciseBlocksEn}
            lessonId={lesson.id}
            opts={{ mode: "practice", starterCodeByExerciseId }}
          />
        ) : null
      }
    />
  );
}
