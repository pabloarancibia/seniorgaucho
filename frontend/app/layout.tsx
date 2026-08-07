import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeniorGaucho — Study Platform",
  description: "Plataforma de estudio interactiva para entrevistas técnicas (Python & TypeScript)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LocaleProvider>
            <Header />
            <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
