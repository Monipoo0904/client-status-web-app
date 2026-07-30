// Root layout: loads the two brand fonts as CSS variables (referenced by
// globals.css via var(--font-heading) / var(--font-sans)) and wraps every
// route. No shared React context/providers live here yet — page.tsx owns
// all app state locally.
import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";

const headingFont = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"]
});

const bodyFont = DM_Sans({
  variable: "--font-sans",
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
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
