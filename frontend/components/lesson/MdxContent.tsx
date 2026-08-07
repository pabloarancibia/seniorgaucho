import { MDXRemote } from "next-mdx-remote/rsc";
import { createMdxComponents } from "@/components/lesson/mdxComponents";

interface MdxContentProps {
  source: string;
  lessonId: string;
}

/**
 * Compila el MDX de la lección en el servidor (Server Component) en cada
 * request. El contenido viene de la base de datos, no de archivos del repo,
 * por eso se compila en runtime en vez de en build time.
 */
export async function MdxContent({ source, lessonId }: MdxContentProps) {
  return <MDXRemote source={source} components={createMdxComponents(lessonId)} />;
}
