"use client";

import useAmountForSale from "@/hooks/useAmountForSale";
import useMinePrice from "@/hooks/useMinePrice";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@nextui-org/react";
import useTokenAllowance from "@/hooks/useTokenAllowance";
import {
  ContractABIs,
  ContractAddresses,
  MineTypeCount,
} from "@/config/constants";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEther } from "viem";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import useMineBalanceOf from "@/hooks/useMineBalanceOf";

export default function Home() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [typeId, setTypeId] = useState(1);
  const [count, setCount] = useState("0");
  const [btnLabel, setBtnLabel] = useState("");

  const { balance: mineBalance, loadBalance: loadMineBalance } =
    useMineBalanceOf(address);
  const { price } = useMinePrice(typeId);
  const { amountForSale, loadAmountForSale } = useAmountForSale(typeId);
  const { allowanceInNumber, loadAllowance } = useTokenAllowance(
    ContractAddresses.Frost,
    address,
    ContractAddresses.Mine
  );

  const handleMint = async () => {
    const cnt = Number(count);
    try {
      if (allowanceInNumber < price * cnt) {
        setBtnLabel("Approving...");
        const txHash = await writeContractAsync({
          abi: ContractABIs.Frost,
          address: ContractAddresses.Frost,
          functionName: "approve",
          args: [
            ContractAddresses.Mine,
            parseEther(Number.MAX_SAFE_INTEGER.toString()),
          ],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: 2,
          hash: txHash,
        });
        loadAllowance();
      }

      setBtnLabel("Minting...");

      const hash = await writeContractAsync({
        abi: ContractABIs.Mine,
        address: ContractAddresses.Mine,
        functionName: "buyNFT",
        args: [typeId, cnt],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: 2,
        hash,
      });

      loadAmountForSale();
      loadMineBalance();
    } catch (error: any) {
      console.error("handleMint", error?.message);
    }
    setBtnLabel("");
  };

  return (
    <div className="flex items-center justify-center gap-10">
      <div className="w-[240px] h-[320px] rounded-[24px] bg-slate-900 flex items-center justify-center text-[64px] font-bold">
        ?
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold mb-5">Buy MINE</h1>
        <div>
          <div className="mb-2">TypeID</div>
          <div className="flex gap-3">
            {new Array(MineTypeCount).fill(0).map((_, ind) => (
              <Button
                key={ind}
                isIconOnly
                onClick={() => setTypeId(ind + 1)}
                variant={ind + 1 === typeId ? "solid" : "bordered"}
                color="primary"
              >
                {ind + 1}
              </Button>
            ))}
          </div>
        </div>
        <div>Price: {price} $FROST</div>
        <div>Balance: {mineBalance}</div>
        <div>Available: {amountForSale}</div>
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            isIconOnly
            disabled={count === "" || Number(count) === 1}
            onClick={() => setCount(Math.max(1, Number(count) - 1) + "")}
          >
            <Icon icon="ic:round-chevron-left" width={24} height={24} />
          </Button>
          <Input
            type="number"
            className="w-20 [&_input]:!text-center"
            value={count}
            onChange={(e) => {
              if (Number(e.target.value) > amountForSale) {
                setCount(amountForSale + "");
              } else {
                setCount(e.target.value);
              }
            }}
          />
          <Button
            color="primary"
            isIconOnly
            disabled={count === "" || Number(count) === amountForSale}
            onClick={() =>
              setCount(Math.min(amountForSale, Number(count) + 1) + "")
            }
          >
            <Icon icon="ic:round-chevron-right" width={24} height={24} />
          </Button>
        </div>
        <Button
          color="primary"
          className="mt-2"
          isLoading={btnLabel !== ""}
          onClick={handleMint}
          disabled={btnLabel !== "" || count === ""}
        >
          {btnLabel === "" ? "Buy MINE" : btnLabel}
        </Button>
      </div>
    </div>
  );
}
