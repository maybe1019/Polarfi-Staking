import { DependencyDelayTime } from "@/config/constants";
import { getMinerBalanceOf } from "@/lib/contracts/miner";
import { useCallback, useEffect, useState } from "react";

const useMinerBalanceOf = (owner: string | undefined, typeId: number) => {
  const [balance, setBalance] = useState(0);

  const loadBalance = useCallback(async () => {
    if (owner) {
      setBalance(await getMinerBalanceOf(owner, typeId));
    } else {
      setBalance(0);
    }
  }, [owner, typeId]);

  useEffect(() => {
    const timerId = setTimeout(loadBalance, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadBalance]);

  return { balance, loadBalance };
};

export default useMinerBalanceOf;
