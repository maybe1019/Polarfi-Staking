import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
} from "@/config/constants";
import { IMineToken } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getMineBalanceOf } from "./useMineBalanceOf";
import { multicall } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";

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

const useMineTokensOf = (address?: string) => {
  const [tokens, setTokens] = useState<IMineToken[]>([]);

  const loadTokens = useCallback(async () => {
    if (!address) {
      return setTokens([]);
    }

    const tokenIds = await getMineTokenIdsOf(address);
    console.log(tokenIds);
    const typeIds = await getMineTokenTypeIds(tokenIds);

    const _tokens: IMineToken[] = [];

    tokenIds.forEach((tokenId, index) => {
      if (isNaN(typeIds[index])) {
        return;
      }
      _tokens.push({
        tokenId,
        typeId: typeIds[index],
      });
    });

    setTokens(_tokens);
  }, [address]);

  useEffect(() => {
    const timerId = setTimeout(loadTokens, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadTokens]);

  return { tokens, loadTokens };
};

export default useMineTokensOf;
