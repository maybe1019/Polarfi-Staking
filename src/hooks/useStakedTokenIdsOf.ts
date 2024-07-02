import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { wagmiClient } from "@/config/web3.config";
import { getStakedTokenIdsOf } from "@/lib/contracts/staking";
import { useCallback, useEffect, useState } from "react";

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
