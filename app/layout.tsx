import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Group V2 | Calculadora", description: "Costos de producción en acrílico" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
