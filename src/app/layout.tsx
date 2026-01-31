import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Torneo Rocket League | Compite y Demuestra tu Nivel",
  description:
    "Únete a la mejor comunidad de Rocket League. Inscríbete en ligas y copas, consulta tus estadísticas, sigue el fixture y lucha por el campeonato.",
  keywords: [
    "Rocket League",
    "Torneo",
    "Liga",
    "Esports",
    "Competencia",
    "Stats",
    "Gaming",
    "Inscripción",
  ],
  authors: [{ name: "Lautaro Gando" }],
  openGraph: {
    title: "Torneo Rocket League | Compite por la Gloria",
    description:
      "Sigue los resultados en vivo, tabla de posiciones y próximas fechas. ¡Inscríbete y demuestra quién es el mejor!",
    url: "https://rocket-league-tournament.vercel.app",
    siteName: "RL Tournament Hub",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "Rocket League Tournament Logo",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Torneo Rocket League",
    description:
      "Inscríbete, compite y sigue tus estadísticas de Rocket League en tiempo real.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

import { ModalProvider } from "@/components/Providers/ModalProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="antialiased bg-gray-900 text-white font-inter">
        {children}
        <ModalProvider />
      </body>
    </html>
  );
}
