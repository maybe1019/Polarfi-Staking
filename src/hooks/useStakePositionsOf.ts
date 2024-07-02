import { DependencyDelayTime } from "@/config/constants";
import { useCallback, useEffect, useState } from "react";
import { IStakePosition } from "@/types";
import { getStakePositionsOf } from "@/lib/contracts/staking";

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
