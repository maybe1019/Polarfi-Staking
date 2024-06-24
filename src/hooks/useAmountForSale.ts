import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";

export const getAmountForSale = async (typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "amountForSale",
      args: [typeId],
    });

    return Number(res);
  } catch (error) {
    console.log("getAmountForSale", error);
    throw error;
  }
};

const useAmountForSale = (typeID: number) => {
  const [amountForSale, setAmountForSale] = useState(0);

  const loadAmountForSale = useCallback(async () => {
    setAmountForSale(await getAmountForSale(typeID));
  }, [typeID]);

  useEffect(() => {
    const timerId = setTimeout(loadAmountForSale, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadAmountForSale]);

  return { amountForSale, loadAmountForSale };
};

export default useAmountForSale;
