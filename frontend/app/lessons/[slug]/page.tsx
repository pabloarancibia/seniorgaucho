import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { MdxContent } from "@/components/lesson/MdxContent";
import { CodeEditorPanel } from "@/components/editor/CodeEditorPanel";

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
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
      <div className="overflow-y-auto border-b border-border p-6 lg:border-b-0 lg:border-r">
        <h1 className="mb-6 text-2xl font-bold">{lesson.title}</h1>
        <MdxContent source={lesson.mdxContent} lessonId={lesson.id} />
      </div>
      <div className="h-full overflow-hidden">
        <CodeEditorPanel lessonId={lesson.id} />
      </div>
    </div>
  );
}
