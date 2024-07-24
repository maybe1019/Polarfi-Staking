import { ContractABIs, ContractAddresses } from "@/config/constants";
import { MainChain, wagmiClient, wagmiConfig } from "@/config/web3.config";
import { IStakingPool } from "@/types";
import { multicall } from "@wagmi/core";
import { formatEther } from "viem";

export const getFrostStakingPoolCount = async () => {
  const poolCount = (await wagmiClient.readContract({
    abi: ContractABIs.FrostStaking,
    address: ContractAddresses.FrostStaking,
    functionName: "poolCount",
  })) as string;

  return Number(poolCount);
};

export const getFrostStakingPools = async () => {
  const poolCount = await getFrostStakingPoolCount();

  let context: any[] = new Array(poolCount).fill(0).map((_, index) => ({
    address: ContractAddresses.FrostStaking,
    abi: ContractABIs.FrostStaking,
    functionName: "pools",
    args: [index],
  }));

  let res = await multicall(wagmiConfig, {
    chainId: MainChain.id,
    contracts: context,
  });

  const pools: IStakingPool[] = [];
  res.forEach((p) => {
    if (!p.result) return;
    const r: any = p.result;
    pools.push({
      poolAddress: r[0],
      poolName: r[1],
      poolTokenAddress: r[2],
      lockAmount: Number(formatEther(r[3])),
      lockPeriod: Number(r[4]),
      tokenSymbol: r[5],
      tokenImage: r[6],
    });
  });

  return pools;
};
