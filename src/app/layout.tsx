import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/layout";
import Provider from "./provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolarFi",
  description: "PolarFi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`bg-[#0B0B0F] dark text-white`}>
      <body>
        <Provider>
          <Layout>{children}</Layout>
        </Provider>
      </body>
    </html>
  );
}
