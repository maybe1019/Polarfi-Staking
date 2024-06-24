import React, { PropsWithChildren } from "react";
import Web3ModalProvider from "@/context/web3.provider";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/config/web3.config";
import { headers } from "next/headers";
import { NextUIProvider } from "@nextui-org/react";

const Provider = ({ children }: PropsWithChildren) => {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie")
  );
  return (
    <NextUIProvider>
      <Web3ModalProvider initialState={initialState}>
        {children}
      </Web3ModalProvider>
    </NextUIProvider>
  );
};

export default Provider;
