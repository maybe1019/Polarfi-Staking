"use client";

import React, { PropsWithChildren } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <NextUIProvider>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </NextUIProvider>
  );
};

export default Provider;
