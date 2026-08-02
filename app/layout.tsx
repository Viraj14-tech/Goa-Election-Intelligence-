import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goa Election Intelligence | 2022–2027 Evidence Briefing",
  description: "A neutral constituency-level dashboard covering Goa's 2022 Assembly result, 2024 signals and 2027 outlook.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
