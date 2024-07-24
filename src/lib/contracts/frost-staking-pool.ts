import { ContractABIs } from "@/config/constants";
import { MainChain, wagmiClient, wagmiConfig } from "@/config/web3.config";
import { IUserLock } from "@/types";
import { Address, formatEther } from "viem";
import { multicall } from "@wagmi/core";

export const getFrostClaimableAmount = async (
  poolAddress: Address,
  user: Address
) => {
  const res: any = await wagmiClient.readContract({
    address: poolAddress,
    abi: ContractABIs.FrostStakingPool,
    functionName: "getClaimableReward",
    args: [user],
  });

  const reward = Number(formatEther(res));
  return reward;
};

export const getFrostStakingUserLock = async (
  poolAddress: Address,
  user: Address
) => {
  const res: any = await wagmiClient.readContract({
    address: poolAddress,
    abi: ContractABIs.FrostStakingPool,
    functionName: "locks",
    args: [user],
  });

  const lock: IUserLock = {
    user: res[0],
    lockAmount: Number(formatEther(res[1])),
    startRoundId: Number(res[2]),
    endRoundId: Number(res[3]),
    startTimestamp: Number(res[4]),
    endTimestamp: Number(res[5]),
    lastClaimedRoundId: Number(res[6]),
    isActive: Boolean(res[7]),
  };

  return lock;
};

export const getFrostStakingCurrentRoundId = async (poolAddress: Address) => {
  const res: any = await wagmiClient.readContract({
    address: poolAddress,
    abi: ContractABIs.FrostStakingPool,
    functionName: "getCurrentRoundId",
    args: [],
  });

  return Number(res);
};

export const getFrostStakingUserClaimableReward = async (
  poolAddress: Address,
  user: Address
) => {
  const res: any = await wagmiClient.readContract({
    address: poolAddress,
    abi: ContractABIs.FrostStakingPool,
    functionName: "getClaimableReward",
    args: [user],
  });

  return Number(formatEther(res));
};

export const getFrostStakingUserLocks = async (
  address: Address,
  poolAddresses: Address[]
) => {
  let context: any[] = poolAddresses.map((poolAddress) => ({
    address: poolAddress,
    abi: ContractABIs.FrostStakingPool,
    functionName: "locks",
    args: [address],
  }));

  let res = await multicall(wagmiConfig, {
    chainId: MainChain.id,
    contracts: context,
  });

  const userLocks: IUserLock[] = [];
  res.forEach((r) => {
    const d: any = r.result;
    if (!d) return;
    userLocks.push({
      user: d[0],
      lockAmount: Number(formatEther(d[1])),
      startRoundId: Number(d[2]),
      endRoundId: Number(d[3]),
      startTimestamp: Number(d[4]),
      endTimestamp: Number(d[5]),
      lastClaimedRoundId: Number(d[6]),
      isActive: Boolean(d[7]),
    });
  });
  return userLocks;
};
