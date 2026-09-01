import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
import { LessonTheory } from "@/components/lesson/LessonTheory";
import { extractPracticableTopicSlugs } from "@/lib/lesson/extractTopicSlugs";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;

  const lesson = await api.getLesson(slug).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <LessonTheory
        titleEs={lesson.title}
        titleEn={lesson.titleEn}
        contentEs={
          <MdxContent
            source={lesson.mdxContent}
            lessonId={lesson.id}
            opts={{
              mode: "theory",
              lessonSlug: slug,
              locale: "es",
              practicableTopicSlugs: extractPracticableTopicSlugs(lesson.mdxContent),
            }}
          />
        }
        contentEn={
          lesson.mdxContentEn ? (
            <MdxContent
              source={lesson.mdxContentEn}
              lessonId={lesson.id}
              opts={{
                mode: "theory",
                lessonSlug: slug,
                locale: "en",
                practicableTopicSlugs: extractPracticableTopicSlugs(lesson.mdxContentEn),
              }}
            />
          ) : null
        }
      />
    </div>
  );
}
