import { DependencyDelayTime } from "@/config/constants";
import { getMinePrice } from "@/lib/contracts/mine";
import { useCallback, useEffect, useState } from "react";

const useMinePrice = (typeID: number) => {
  const [price, setPrice] = useState(0);

  const loadPrice = useCallback(async () => {
    setPrice(await getMinePrice(typeID));
  }, [typeID]);

  useEffect(() => {
    const timerId = setTimeout(loadPrice, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadPrice]);

  return { price, loadPrice };
};

export default useMinePrice;
