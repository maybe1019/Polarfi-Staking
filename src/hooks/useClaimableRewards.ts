import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { useCallback, useEffect, useState } from "react";
import { multicall } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { formatEther } from "viem";
import { IStakeReward } from "@/types";

export const getClaimableRewards = async (tokenIds: number[]) => {
  if (tokenIds.length === 0) {
    return [];
  }
  try {
    let context: any[] = tokenIds.map((tokenId) => ({
      address: ContractAddresses.Staking,
      abi: ContractABIs.Staking,
      functionName: "calculateClaimableRewardAmount",
      args: [tokenId],
    }));

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    const rewards: IStakeReward[] = [];
    res.forEach((v, i) => {
      if (v.status === "success") {
        const r = v.result as any;
        rewards.push({
          reward: Number(formatEther(r[0])),
          tokenId: tokenIds[i],
          currentLPR: Math.min(Number(r[1]) / 100, 100),
        });
      }
    });

    return rewards;
  } catch (error) {
    console.error("getClaimableRewards", error);
    return [];
  }
};

const useClaimableRewards = (tokenIds: number[]) => {
  const [rewards, setRewards] = useState<IStakeReward[]>([]);

  const loadRewards = useCallback(async () => {
    setRewards(await getClaimableRewards(tokenIds));
  }, [tokenIds]);

  useEffect(() => {
    const timerId = setTimeout(loadRewards, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadRewards]);

  return { rewards, loadRewards };
};

export default useClaimableRewards;
