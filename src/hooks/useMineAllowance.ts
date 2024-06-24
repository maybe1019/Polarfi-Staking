import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";

export const getMineAllowance = async (owner: string, operator: string) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });

    return Boolean(res);
  } catch (error) {
    console.error("getMineAllowance", error);
    throw error;
  }
};

const useMineAllowance = (owner?: string, operator?: string) => {
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);

  const loadIsApprovedForAll = useCallback(async () => {
    if (!owner || !operator) {
      return setIsApprovedForAll(false);
    }
    setIsApprovedForAll(await getMineAllowance(owner, operator));
  }, [owner, operator]);

  useEffect(() => {
    const timerId = setTimeout(loadIsApprovedForAll, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadIsApprovedForAll]);

  return { isApprovedForAll, loadIsApprovedForAll };
};

export default useMineAllowance;
