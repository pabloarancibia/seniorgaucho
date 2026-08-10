import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
import { LessonTheory } from "@/components/lesson/LessonTheory";
import { CodeEditorPanel } from "@/components/editor/CodeEditorPanel";
import { ResizableSplitPane } from "@/components/layout/ResizableSplitPane";

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
    <ResizableSplitPane
      left={
        <LessonTheory
          titleEs={lesson.title}
          titleEn={lesson.titleEn}
          contentEs={<MdxContent source={lesson.mdxContent} lessonId={lesson.id} />}
          contentEn={
            lesson.mdxContentEn ? <MdxContent source={lesson.mdxContentEn} lessonId={lesson.id} /> : null
          }
        />
      }
      right={<CodeEditorPanel lessonId={lesson.id} />}
    />
  );
}
