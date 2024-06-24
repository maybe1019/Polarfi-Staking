import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";

export const getMineBalanceOf = async (owner: string) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "balanceOf",
      args: [owner],
    });

    return Number(res);
  } catch (error) {
    console.log("getMineBalanceOf", error);
    throw error;
  }
};

const useMineBalanceOf = (owner?: string) => {
  const [balance, setBalance] = useState(0);

  const loadBalance = useCallback(async () => {
    try {
      if (owner) {
        setBalance(await getMineBalanceOf(owner));
      } else {
        setBalance(0);
      }
    } catch (error) {
      setBalance(0);
    }
  }, [owner]);

  useEffect(() => {
    const timerId = setTimeout(loadBalance, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadBalance]);

  return { balance, loadBalance };
};

export default useMineBalanceOf;
