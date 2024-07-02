import { DependencyDelayTime } from "@/config/constants";
import { getMineAllowance } from "@/lib/contracts/mine";
import { useCallback, useEffect, useState } from "react";

const useMineAllowance = (owner?: string, operator?: string) => {
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);

  const loadIsApprovedForAll = useCallback(async () => {
    if (!owner || !operator) {
      return setIsApprovedForAll(false);
    }
    setIsApprovedForAll(await getMineAllowance(owner, operator));
  }, [owner, operator]);

  useEffect(() => {
    const timerId = setTimeout(loadIsApprovedForAll, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadIsApprovedForAll]);

  return { isApprovedForAll, loadIsApprovedForAll };
};

export default useMineAllowance;
