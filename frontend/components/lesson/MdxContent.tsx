import { MDXRemote } from "next-mdx-remote/rsc";
import { createMdxComponents, type MdxRenderOptions } from "@/components/lesson/mdxComponents";

interface MdxContentProps {
  source: string;
  lessonId: string;
  opts: MdxRenderOptions;
}

/**
 * Compila el MDX de la lección en el servidor (Server Component) en cada
 * request. El contenido viene de la base de datos, no de archivos del repo,
 * por eso se compila en runtime en vez de en build time. `opts` decide si
 * este compilado es la pantalla de teoría o la de práctica de un tema — ver
 * mdxComponents.tsx.
 */
export async function MdxContent({ source, lessonId, opts }: MdxContentProps) {
  return <MDXRemote source={source} components={createMdxComponents(lessonId, opts)} />;
}
