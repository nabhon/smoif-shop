import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { CartButton } from "@/components/cart-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickOrder Shop",
  description: "Fast and easy shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <a href="/" className="text-xl font-bold text-indigo-600">
                  QuickOrder
                </a>
                <CartButton />
              </div>
            </header>
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {children}
            </main>
            <footer className="bg-white border-t py-8 mt-auto">
              <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} QuickOrder System
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
