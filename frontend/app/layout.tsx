import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { THEME_STORAGE_KEY } from "@/lib/theme/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeniorGaucho — Study Platform",
  description: "Plataforma de estudio interactiva para entrevistas técnicas (Python & TypeScript)",
};

// Corre sincrónicamente mientras el browser parsea el HTML, antes del primer
// paint y antes de que React hidrate — evita el flash de tema equivocado sin
// pasar el tema por estado de React durante el render del servidor.
// Ver: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <Header />
            <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
