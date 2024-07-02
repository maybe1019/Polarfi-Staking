import { DependencyDelayTime } from "@/config/constants";
import { getMineBalanceOf } from "@/lib/contracts/mine";
import { useCallback, useEffect, useState } from "react";

const useMineBalanceOf = (owner?: string) => {
  const [balance, setBalance] = useState(0);

  const loadBalance = useCallback(async () => {
    try {
      if (owner) {
        setBalance(await getMineBalanceOf(owner));
      } else {
        setBalance(0);
      }
    } catch (error) {
      setBalance(0);
    }
  }, [owner]);

  useEffect(() => {
    const timerId = setTimeout(loadBalance, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadBalance]);

  return { balance, loadBalance };
};

export default useMineBalanceOf;
