"use client";

import { DependencyDelayTime } from "@/config/constants";
import { useAppDispatch } from "@/store";
import {
  loadFrostStakingPoolsThunk,
  loadMineInfoThunk,
  loadMinerInfoThunk,
} from "@/store/reducers/appReducer";
import {
  loadUserMinerBalancesThunk,
  loadUserMinesThunk,
  loadUserStakePositionsThunk,
} from "@/store/reducers/userReducer";
import React, { PropsWithChildren, useEffect } from "react";
import { useAccount } from "wagmi";

const Template = ({ children }: PropsWithChildren) => {
  const { address } = useAccount();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch(loadUserMinesThunk({ address }));
      dispatch(loadUserMinerBalancesThunk({ address }));
      dispatch(loadUserStakePositionsThunk({ address }));
    }, DependencyDelayTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [address, dispatch]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch(loadMineInfoThunk([]));
      dispatch(loadMinerInfoThunk());
      dispatch(loadFrostStakingPoolsThunk());
    }, DependencyDelayTime);

    return () => clearTimeout(timerId);
  }, [dispatch]);

  return <>{children}</>;
};

export default Template;
