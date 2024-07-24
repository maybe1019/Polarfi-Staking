import { getFrostStakingUserLock } from "@/lib/contracts/frost-staking-pool";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Address } from "viem";

export const useFrostStakingUserLock = (
  poolAddress: Address,
  user?: Address
) => {
  const fetchUserLock = useCallback(async () => {
    if (!user) return undefined;

    const res = await getFrostStakingUserLock(poolAddress, user);
    return res;
  }, [poolAddress, user]);

  const { data } = useQuery({
    queryKey: ["frostStaking", "userLock"],
    enabled: Boolean(user),
    queryFn: fetchUserLock,
  });

  return data;
};
