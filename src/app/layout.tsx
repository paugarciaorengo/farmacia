import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaskLayout from "./components/MaskLayout";
import NavBar from "./components/NavBar"; 
import CartSidebar from "@/src/features/cart/CartSidebar"; 
import Footer from "./components/Footer";
import { Providers } from "./providers";

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
            <CartSidebar /> 

            {/* ✅ 2. Contenedor Flex para "Sticky Footer" */}
            <div className="flex flex-col min-h-screen">

              <NavBar />

              {/* ✅ 3. El main crece (flex-grow) para empujar el footer abajo */}
              <main className="flex-grow">
                {children}
              </main>

              <Footer />

            </div>
          </MaskLayout>
        </Providers>
      </body>
    </html>
  );
}