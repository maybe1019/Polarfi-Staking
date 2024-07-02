import { ContractABIs, ContractAddresses } from "@/config/constants";
import { MainChain, wagmiClient, wagmiConfig } from "@/config/web3.config";
import { IMinerInfo } from "@/types";
import { multicall } from "@wagmi/core";
import { formatEther } from "viem";

export const getMinerInfo = async () => {
  try {
    let context: any[] = [];

    for (let typeId = 0; typeId < 7; typeId++) {
      context.push({
        address: ContractAddresses.Miner,
        abi: ContractABIs.Miner,
        functionName: "prices",
        args: [typeId],
      });
    }

    context.push({
      address: ContractAddresses.Miner,
      abi: ContractABIs.Miner,
      functionName: "repairRate",
      args: [],
    });

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    const info: IMinerInfo[] = [];

    for (let typeId = 0; typeId < 7; typeId++) {
      info.push({
        typeId,
        price: Number(
          formatEther(BigInt((res[typeId].result as string) || "0"))
        ),
      });
    }

    return {
      prices: info,
      repairRate: Number(res[7].result || "1000"),
    };
  } catch (error) {
    throw error;
  }
};

export const getMinerBalanceOf = async (owner: string, typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Miner,
      address: ContractAddresses.Miner,
      functionName: "balanceOf",
      args: [owner, typeId],
    });

    return Number(res);
  } catch (error) {
    console.log("getMinerBalanceOf", error);
    throw error;
  }
};

export const getMinerBalancesOf = async (
  owner: string,
  tokenIds?: number[]
) => {
  if (!tokenIds) {
    tokenIds = new Array(6).fill(0).map((_, i) => i + 1);
  }

  let context: any[] = [];

  tokenIds.forEach((tokenId) => {
    context.push({
      address: ContractAddresses.Miner,
      abi: ContractABIs.Miner,
      functionName: "balanceOf",
      args: [owner, tokenId],
    });
  });

  let res = await multicall(wagmiConfig, {
    chainId: MainChain.id,
    contracts: context,
  });

  console.log("res", res);

  return res.map((r, i) => ({
    tokenId: tokenIds[i],
    balance: Number(r?.result || "0"),
  }));
};

export const getMinerPrice = async (typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Miner,
      address: ContractAddresses.Miner,
      functionName: "prices",
      args: [typeId],
    });

    return Number(formatEther(BigInt(res)));
  } catch (error) {
    console.log("getMinerPrice", error);
    throw error;
  }
};
