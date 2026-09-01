/**
 * Deriva un slug estable a partir de un título de MDX (título de <Section> o
 * de <Exercise>). Compartido entre Exercise (exerciseId), Section (topicSlug)
 * y el ruteo de la pantalla de práctica — si el título cambia más adelante,
 * el estado persistido bajo ese slug se pierde (costo aceptable: estudio
 * personal de un solo usuario, no hay integridad multi-usuario en juego).
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos (tildes) tras NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
