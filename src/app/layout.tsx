import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaskLayout from "./components/MaskLayout";
import NavBar from "./components/NavBar"; 
import CartSidebar from "@/src/features/cart/CartSidebar"; 

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
          {/* ✅ 2. Añadir el componente aquí para que esté disponible en todas las páginas */}
          <CartSidebar /> 
          
          {/* La NavBar forma parte del contenido que se revela con la máscara */}
          <NavBar />
          <main>{children}</main>
        </MaskLayout>
      </body>
    </html>
  );
}