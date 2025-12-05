import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaskLayout from "./components/MaskLayout";
import NavBar from "./components/NavBar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmacia Online",
  description: "Tu farmacia de confianza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MaskLayout>
          {/* 🔹 La NavBar forma parte del contenido que se revela con la máscara */}
          <NavBar />
          <main>{children}</main>
        </MaskLayout>
      </body>
    </html>
  );
}
