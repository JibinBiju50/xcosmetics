import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Xcosmetic - Premium Beauty Products",
  description: "Shop premium cosmetic and skincare products. Best deals on face creams, serums, hair oils, and more. Free shipping available.",
  keywords: "cosmetics, skincare, beauty products, face cream, hair oil, lip balm, sunscreen",
  openGraph: {
    title: "Xcosmetic - Premium Beauty Products",
    description: "Shop premium cosmetic and skincare products with exclusive offers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {/* Replace with your actual WhatsApp number */}
        <WhatsAppFloat phoneNumber="917592971028" />
      </body>
    </html>
  );
}