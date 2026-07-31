import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modular Multitenant SaaS",
  description: "Core Base Platform for Enterprise Business Modules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
