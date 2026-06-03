import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunJeju — 제주 디지털 월드",
  description: "제주도라는 무대 위의 디지털 월드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
