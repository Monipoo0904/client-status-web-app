import type { Metadata } from "next";
import { Space_Grotesk, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"]
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Client Status Dashboard",
  description: "Demo project status dashboards for clients and delivery teams"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
