import { ContractABIs, ContractAddresses } from "@/config/constants";
import { MainChain, wagmiClient, wagmiConfig } from "@/config/web3.config";
import { IMineInfo } from "@/types";
import { multicall } from "@wagmi/core";
import { formatEther } from "viem";

export const getMineInfo = async (typeIds: number[]) => {
  try {
    let context: any[] = [];

    typeIds.forEach((typeId) => {
      context.push({
        address: ContractAddresses.Mine,
        abi: ContractABIs.Mine,
        functionName: "prices",
        args: [typeId],
      });
      context.push({
        address: ContractAddresses.Mine,
        abi: ContractABIs.Mine,
        functionName: "amountForSale",
        args: [typeId],
      });
    });

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    const info: IMineInfo[] = [];

    typeIds.forEach((typeId, index) => {
      info.push({
        typeId,
        price: Number(
          formatEther(BigInt((res[index * 2].result as string) || "0"))
        ),
        amountForSale: Number((res[index * 2 + 1].result as string) || "0"),
      });
    });

    return info;
  } catch (error) {
    throw error;
  }
};

export const getMineBalanceOf = async (owner: string) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "balanceOf",
      args: [owner],
    });

    return Number(res);
  } catch (error) {
    console.error("getMineBalanceOf", error);
    throw error;
  }
};

export const getMineTotalSupply = async () => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "totalSupply",
      args: [],
    });

    return Number(res);
  } catch (error) {
    console.error("getMineBalanceOf", error);
    throw error;
  }
};

export const getMineTokenIdsOf = async (address: string) => {
  try {
    const balance = await getMineBalanceOf(address);
    let context: any[] = new Array(balance).fill(0).map((_, index) => ({
      address: ContractAddresses.Mine,
      abi: ContractABIs.Mine,
      functionName: "tokenOfOwnerByIndex",
      args: [address, index],
    }));

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    const tokenIds: number[] = [];
    res.forEach((v) => {
      if (v.status === "success") tokenIds.push(Number(v.result));
    });

    return tokenIds;
  } catch (error) {
    throw error;
  }
};

export const getMineTokenTypeIds = async (tokenIds: number[]) => {
  try {
    let context: any[] = tokenIds.map((tokenId) => ({
      address: ContractAddresses.Mine,
      abi: ContractABIs.Mine,
      functionName: "typeOfToken",
      args: [tokenId],
    }));

    let res = await multicall(wagmiConfig, {
      chainId: MainChain.id,
      contracts: context,
    });

    return res.map((v) => Number(v.result));
  } catch (error) {
    throw error;
  }
};

export const getMineAllowance = async (owner: string, operator: string) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "isApprovedForAll",
      args: [owner, operator],
    });

    return Boolean(res);
  } catch (error) {
    console.error("getMineAllowance", error);
    throw error;
  }
};

export const getMinePrice = async (typeId: number) => {
  try {
    const res: any = await wagmiClient.readContract({
      abi: ContractABIs.Mine,
      address: ContractAddresses.Mine,
      functionName: "prices",
      args: [typeId],
    });

    return Number(formatEther(BigInt(res)));
  } catch (error) {
    console.error("getMinePrice", error);
    throw error;
  }
};
