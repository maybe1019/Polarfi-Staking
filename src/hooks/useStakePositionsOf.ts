import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { getStakedTokenIdsOf } from "./useStakedTokenIdsOf";
import { multicall } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { useCallback, useEffect, useState } from "react";
import { IStakePosition } from "@/types";
import { formatEther } from "viem";

export const getStakePositionsOf = async (staker: string) => {
  try {
    const tokenIds = await getStakedTokenIdsOf(staker);

    let context: any[] = tokenIds.map((tokenId) => ({
      address: ContractAddresses.Staking,
      abi: ContractABIs.Staking,
      functionName: "positions",
      args: [tokenId],
    }));

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    const positions: IStakePosition[] = [];
    res.forEach((v) => {
      if (v.status === "success") {
        const value: any = v.result;
        positions.push({
          user: value[0],
          nftType: Number(value[1]),
          tokenId: Number(value[2]),
          buyPrice: Number(formatEther(value[3])),
          stakedTimestamp: Number(value[4]) * 1000,
          latestClaimedTimestamp: Number(value[5]) * 1000,
          latestLpr: Number(value[6]),
          claimedRewards: Number(formatEther(value[7])),
          isStaked: Boolean(value[8]),
        });
      }
    });
    return positions;
  } catch (error) {
    console.error("getStakePositionsOf", error);
    return [];
  }
};

const useStakePositionsOf = (staker?: string) => {
  const [positions, setPositions] = useState<IStakePosition[]>([]);

  const loadPositions = useCallback(async () => {
    if (!staker) {
      return setPositions([]);
    }

    setPositions(await getStakePositionsOf(staker));
  }, [staker]);

  useEffect(() => {
    const timerId = setTimeout(loadPositions, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadPositions]);

  return { positions, loadPositions };
};

export default useStakePositionsOf;
