import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";

export const getMinerBalanceOf = async (owner: string, typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Miner,
      address: ContractAddresses.Miner,
      functionName: "balanceOf",
      args: [owner, typeId],
    });

    return Number(res);
  } catch (error) {
    console.log("getMinerBalanceOf", error);
    throw error;
  }
};

const useMinerBalanceOf = (owner: string | undefined, typeId: number) => {
  const [balance, setBalance] = useState(0);

  const loadBalance = useCallback(async () => {
    if (owner) {
      setBalance(await getMinerBalanceOf(owner, typeId));
    } else {
      setBalance(0);
    }
  }, [owner, typeId]);

  useEffect(() => {
    const timerId = setTimeout(loadBalance, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadBalance]);

  return { balance, loadBalance };
};

export default useMinerBalanceOf;
