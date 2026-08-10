import { syllabus } from "@/lib/syllabus/data";
import { SyllabusView } from "@/components/lesson/SyllabusView";

export default function TemarioPage() {
  return <SyllabusView modules={syllabus} />;
}
