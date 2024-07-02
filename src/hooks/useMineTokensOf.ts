import { DependencyDelayTime } from "@/config/constants";
import { IMineToken } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getMineTokenIdsOf, getMineTokenTypeIds } from "@/lib/contracts/mine";

const useMineTokensOf = (address?: string) => {
  const [tokens, setTokens] = useState<IMineToken[]>([]);

  const loadTokens = useCallback(async () => {
    if (!address) {
      return setTokens([]);
    }

    const tokenIds = await getMineTokenIdsOf(address);
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
