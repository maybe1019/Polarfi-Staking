import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

import { formatUnits } from "viem";
import { ContractABIs, DependencyDelayTime } from "@/config/constants";

const useTokenAllowance = (
  tokenAddress?: string,
  owner?: string,
  operator?: string,
  decimals?: number
) => {
  const publicClient = usePublicClient();

  const [allowance, setAllowance] = useState("0");
  const [allowanceInNumber, setAllowanceInNumber] = useState(0);

  const loadAllowance = useCallback(async () => {
    let _decimals = decimals;
    if (!owner || !operator || !publicClient || !tokenAddress) {
      setAllowance("0");
      setAllowanceInNumber(0);
      return;
    }
    if (!_decimals) {
      const res: any = await publicClient.readContract({
        abi: ContractABIs.ERC20,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals",
      });
      _decimals = Number(res);
    }

    const _balance = (await publicClient.readContract({
      abi: ContractABIs.ERC20,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [owner, operator],
    })) as string;

    setAllowance(_balance);
    setAllowanceInNumber(Number(formatUnits(BigInt(_balance), _decimals)));
  }, [tokenAddress, owner, operator, decimals, publicClient]);

  useEffect(() => {
    const timerId = setTimeout(loadAllowance, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadAllowance]);

  return {
    allowanceInString: allowance,
    allowanceInNumber: allowanceInNumber,
    loadAllowance,
  };
};

export default useTokenAllowance;
