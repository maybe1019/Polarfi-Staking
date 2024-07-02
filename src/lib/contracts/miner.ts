import { ContractABIs, ContractAddresses } from "@/config/constants";
import { MainChain, wagmiConfig } from "@/config/web3.config";
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
