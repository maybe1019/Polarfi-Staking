import { DependencyDelayTime } from "@/config/constants";
import { getMinerPrice } from "@/lib/contracts/miner";
import { useCallback, useEffect, useState } from "react";

const useMinerPrice = (typeID: number) => {
  const [price, setPrice] = useState(0);

  const loadPrice = useCallback(async () => {
    setPrice(await getMinerPrice(typeID));
  }, [typeID]);

  useEffect(() => {
    const timerId = setTimeout(loadPrice, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadPrice]);

  return { price, loadPrice };
};

export default useMinerPrice;
