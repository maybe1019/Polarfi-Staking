import {
  ContractABIs,
  ContractAddresses,
  MineNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { RootState, useAppDispatch } from "@/store";
import { Icon } from "@iconify/react";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getFrostAllowance } from "@/lib/contracts/frost";
import { parseEther } from "viem";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { loadMineInfoThunk } from "@/store/reducers/appReducer";
import { addNewMinesThunk } from "@/store/reducers/userReducer";

type Props = {
  typeId: number;
};

const MinePurchaseCard = ({ typeId }: Props) => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const mineInfo = useSelector(
    (state: RootState) => state.app.mineInfo[typeId]
  );

  const balance = useSelector(
    (state: RootState) =>
      state.user.mines.data.filter((d) => d.nftType === typeId).length
  );

  const [count, setCount] = useState("1");
  const [btnLabel, setBtnLabel] = useState("");

  const handleMint = async () => {
    const cnt = Number(count);
    if (!address) {
      return;
    }

    try {
      const allowanceInNumber = await getFrostAllowance(
        address,
        ContractAddresses.Mine
      );
      if (allowanceInNumber < mineInfo.price * cnt) {
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
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
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
        confirmations: TransactionConfirmBlockCount,
        hash,
      });

      dispatch(loadMineInfoThunk([typeId]));
      dispatch(addNewMinesThunk({ cnt, typeId, address }));
    } catch (error: any) {
      console.error("handleMint", error?.message);
    }
    setBtnLabel("");
  };
  return (
    <div className="bg-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div>
        <Image
          src={`/imgs/mines/${typeId}.png`}
          alt="mine"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>
      <div className="p-6 flex flex-col gap-2">
        <div className="text-[24px] text-center font-bold">
          {MineNames[typeId]}
        </div>

        <div className="space-y-2 my-auto py-2">
          <div className="flex justify-between">
            <span>Price</span>
            <span>{mineInfo.price} $FROST</span>
          </div>
          <div className="flex justify-between">
            <span>Balance</span>
            <span>{balance}</span>
          </div>
          <div className="flex justify-between">
            <span>Available</span>
            <span>{mineInfo.amountForSale}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mx-auto">
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
              if (Number(e.target.value) > mineInfo.amountForSale) {
                setCount(mineInfo.amountForSale + "");
              } else {
                setCount(e.target.value);
              }
            }}
          />
          <Button
            color="primary"
            isIconOnly
            disabled={count === "" || Number(count) === mineInfo.amountForSale}
            onClick={() =>
              setCount(Math.min(mineInfo.amountForSale, Number(count) + 1) + "")
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
};

export default MinePurchaseCard;
