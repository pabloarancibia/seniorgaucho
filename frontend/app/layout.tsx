import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ProviderPreferenceProvider } from "@/lib/llm/ProviderPreferenceProvider";
import { Header } from "@/components/layout/Header";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme/constants";
import "./globals.css";

// Sans-serif cálida y redondeada — el look "amigable" de la paleta Soft &
// Pop empieza en la tipografía, no solo en el color. Self-hosted por
// next/font (sin request a Google en runtime, sin layout shift).
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

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
      <body className={`${manrope.variable} min-h-screen bg-bg font-sans text-fg antialiased`}>
        <ThemeProvider>
          <LocaleProvider>
            <ProviderPreferenceProvider>
              <Header />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              {/* Fijo, fuera del flujo — visible en cualquier pantalla, incluida
                  la de práctica (layout de altura fija propio, sin scroll de body). */}
              <div className="fixed bottom-4 left-4 z-50">
                <LocaleToggle />
              </div>
            </ProviderPreferenceProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
