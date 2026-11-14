import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Group V2 | Calculadora",
 description: "Costos de producción en acrílico",
 applicationName: "Group V2",
 manifest: "/manifest.webmanifest",
 icons: { icon: "/icon.svg", apple: "https://drive.google.com/thumbnail?id=1_VWBCGAwNwhWiTHvWn_VTvUP_jYhjHnD&sz=w512" },
 appleWebApp: { capable: true, title: "Group V2", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#130b23", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
