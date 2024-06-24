import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";

export const getStakedTokenIdsOf = async (staker: string) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Staking,
      address: ContractAddresses.Staking,
      functionName: "getStakedNFTsPerUser",
      args: [staker],
    });

    return (res as any[]).map((d: any) => Number(d));
  } catch (error) {
    console.error("getStakedTokenIdsOf", error);
    throw error;
  }
};

const useStakedTokenIdsOf = (owner?: string) => {
  const [tokenIds, setTokenIds] = useState<number[]>([]);

  const loadStakedTokenIds = useCallback(async () => {
    if (!owner) {
      return setTokenIds([]);
    }
    try {
      setTokenIds(await getStakedTokenIdsOf(owner));
    } catch (error) {
      setTokenIds([]);
    }
  }, [owner]);

  useEffect(() => {
    const timerId = setTimeout(loadStakedTokenIds, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadStakedTokenIds]);

  return {
    tokenIds,
    loadStakedTokenIds,
  };
};

export default useStakedTokenIdsOf;
