import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
import { PracticeScreen } from "@/components/lesson/PracticeScreen";
import { extractTopicSlugs } from "@/lib/lesson/extractTopicSlugs";

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

  return (
    <PracticeScreen
      lessonId={lesson.id}
      lessonSlug={slug}
      topicSlug={topicSlug}
      statementEs={
        <MdxContent
          source={lesson.mdxContent}
          lessonId={lesson.id}
          opts={{ mode: "practice", activeTopicSlug: topicSlug }}
        />
      }
      statementEn={
        lesson.mdxContentEn ? (
          <MdxContent
            source={lesson.mdxContentEn}
            lessonId={lesson.id}
            opts={{ mode: "practice", activeTopicSlug: topicSlug }}
          />
        ) : null
      }
    />
  );
}
