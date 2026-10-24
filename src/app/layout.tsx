
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormFlow — Interactive Forms & Chatbot",
  description:
    "Build interactive forms, engage visitors through a chatbot, and manage submissions in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
