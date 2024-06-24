import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";

export const getMinePrice = async (typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "prices",
      args: [typeId],
    });

    return Number(formatEther(BigInt(res)));
  } catch (error) {
    console.log("getMinePrice", error);
    throw error;
  }
};

const useMinePrice = (typeID: number) => {
  const [price, setPrice] = useState(0);

  const loadPrice = useCallback(async () => {
    setPrice(await getMinePrice(typeID));
  }, [typeID]);

  useEffect(() => {
    const timerId = setTimeout(loadPrice, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadPrice]);

  return { price, loadPrice };
};

export default useMinePrice;
