"use client";

import { DependencyDelayTime } from "@/config/constants";
import { useAppDispatch } from "@/store";
import { loadUserMinesThunk } from "@/store/reducers/userReducer";
import React, { PropsWithChildren, useEffect } from "react";
import { useAccount } from "wagmi";

const Template = ({ children }: PropsWithChildren) => {
  const { address } = useAccount();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch(loadUserMinesThunk(address));
    }, DependencyDelayTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [address, dispatch]);

  return <>{children}</>;
};

export default Template;
