import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeSync from "@/components/ThemeSync";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ganzy — Study Planner",
  description:
    "Ganzy plans study time around your real life and tells you exactly what to do next.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e8720a",
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var raw = localStorage.getItem('ganzy-app-state');
    if (raw) {
      var parsed = JSON.parse(raw);
      var dark = parsed && parsed.state && parsed.state.darkMode;
      if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-full"
        style={{ fontFamily: "var(--font-jakarta), var(--font-sans)" }}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
