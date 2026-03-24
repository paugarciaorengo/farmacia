// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaskLayout from "./components/MaskLayout";
import NavBar from "./components/NavBar"; 
import CartSidebar from "@/src/features/cart/CartSidebar"; 
import Footer from "./components/Footer";
import { Providers } from "./providers";
import ChristmasSnow from "./components/ChristmasSnow";
import Chatbot from "@/src/components/Chatbot";

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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <MaskLayout>
            <ChristmasSnow />
            <CartSidebar /> 

            {/* ✅ 2. Contenedor Flex para "Sticky Footer" */}
            <div className="flex flex-col min-h-screen">

              <NavBar />

              {/* ✅ 3. CAMBIO IMPORTANTE AQUI 👇 */}
              {/* Añadimos pt-24 (padding-top) para que la barra no tape el título */}
              <main className="flex-grow pt-24 md:pt-15">
                {children}
                <Chatbot /> {/* Agregamos el chatbot aquí para que esté disponible en todas las páginas */}
              </main>

              <Footer />

            </div>
          </MaskLayout>
        </Providers>
      </body>
    </html>
  );
}