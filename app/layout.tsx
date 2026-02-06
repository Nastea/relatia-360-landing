import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RELAȚIA 360 - De la conflict la conectare",
  description: "Curs practic de comunicare în relații",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${dmSerifDisplay.variable} ${inter.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="min-h-screen antialiased flex flex-col" style={{ background: "linear-gradient(to bottom, #f5ede3, #ebdfce)", fontFamily: "var(--font-body)" }}>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
