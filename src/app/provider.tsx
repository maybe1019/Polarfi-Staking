"use client";

import React, { PropsWithChildren } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <NextUIProvider>
      <ReduxProvider store={store}>
        <ToastContainer theme="dark" hideProgressBar autoClose={3000} />
        {children}
      </ReduxProvider>
    </NextUIProvider>
  );
};

export default Provider;
