import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
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
        <>
          <h1 className="mb-6 text-2xl font-bold">{lesson.title}</h1>
          <MdxContent source={lesson.mdxContent} lessonId={lesson.id} />
        </>
      }
      right={<CodeEditorPanel lessonId={lesson.id} />}
    />
  );
}
