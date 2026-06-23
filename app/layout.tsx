import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SparringMap",
  description: "Visual strategic sparring for early ideas and projects.",
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
