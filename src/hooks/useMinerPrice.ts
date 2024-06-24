import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";

export const getMinerPrice = async (typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Miner,
      address: ContractAddresses.Miner,
      functionName: "prices",
      args: [typeId],
    });

    return Number(formatEther(BigInt(res)));
  } catch (error) {
    console.log("getMinerPrice", error);
    throw error;
  }
};

const useMinerPrice = (typeID: number) => {
  const [price, setPrice] = useState(0);

  const loadPrice = useCallback(async () => {
    setPrice(await getMinerPrice(typeID));
  }, [typeID]);

  useEffect(() => {
    const timerId = setTimeout(loadPrice, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadPrice]);

  return { price, loadPrice };
};

export default useMinerPrice;
