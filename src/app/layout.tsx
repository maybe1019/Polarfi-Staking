import type { Metadata } from "next";
import React from "react";
import Provider from "./provider";
import Layout from "@/components/layout/layout";
import Web3ModalProvider from "@/context/web3.provider";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/config/web3.config";
import { headers } from "next/headers";

import "./globals.css";

export const metadata: Metadata = {
  title: "PolarFi",
  description: "PolarFi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie")
  );
  return (
    <html lang="en" className={`bg-[#0B0B0F] dark text-white`}>
      <body suppressHydrationWarning={true}>
        <Provider>
          <Web3ModalProvider initialState={initialState}>
            <Layout>{children}</Layout>
          </Web3ModalProvider>
        </Provider>
      </body>
    </html>
  );
}
