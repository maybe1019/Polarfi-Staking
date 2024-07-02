import { ContractABIs, ContractAddresses } from "@/config/constants";
import { MainChain, wagmiClient, wagmiConfig } from "@/config/web3.config";
import { IStakePosition } from "@/types";
import { multicall } from "@wagmi/core";
import { formatEther } from "viem";

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

export const getStakePositions = async (tokenIds: number[]) => {
  try {
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
          latestLpr: Number(value[4]) === 0 ? 10000 : Number(value[6]),
          claimedRewards: Number(formatEther(value[7])),
          isStaked: Boolean(value[8]),
        });
      }
    });
    return positions;
  } catch (error) {
    console.error("getStakePositionsOf", error);
    throw error;
  }
};

export const getStakePositionsOf = async (staker: string) => {
  const tokenIds = await getStakedTokenIdsOf(staker);
  return await getStakePositions(tokenIds);
};
