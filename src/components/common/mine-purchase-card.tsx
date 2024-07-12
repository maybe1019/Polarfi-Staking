import {
  ContractABIs,
  ContractAddresses,
  Messages,
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
import { toast } from "react-toastify";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";

type Props = {
  typeId: number;
};

const MinePurchaseCard = ({ typeId }: Props) => {
  const dispatch = useAppDispatch();
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { checkNetworkStatus } = useCheckNetworkStatus();

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
    if (!checkNetworkStatus()) {
      return;
    }

    if (!address) {
      return;
    }

    const cnt = Number(count);

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

      toast.success(Messages.Success);
    } catch (error: any) {
      console.error("handleMint", error?.message);
      toast.error(Messages.TransactionRejected);
    }
    setBtnLabel("");
  };
  return (
    <div className="bg-[#131924] rounded-xl overflow-hidden flex p-5 gap-6">
      <div className="bg-[#A0AECB] w-[350px] rounded-xl">
        <Image
          src={`/imgs/mines/${typeId}.gif`}
          alt="mine"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-2 grow bg-[#131924]">
        <div className="text-[32px] text-center font-bold">
          {MineNames[typeId]}
        </div>

        <div className="grid grid-cols-3 gap-5 my-auto">
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-5 border-white/10 rounded-xl">
            <span className="text-white/50">Price</span>
            <span className="text-[24px] font-bold">
              {mineInfo.price} $FROST
            </span>
          </div>
          <div className="flex justify-between flex-col items-center bg-[#191c2cb6] border-2 py-5 border-white/10 rounded-xl">
            <span className="text-white/50">Balance</span>
            <span className="text-[24px] font-bold">{balance}</span>
          </div>
          <div className="flex justify-between flex-col items-center bg-[#191c2cb6] border-2 py-5 border-white/10 rounded-xl">
            <span className="text-white/50">Available</span>
            <span className="text-[24px] font-bold">
              {mineInfo.amountForSale}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mx-auto">
          <Button
            color="primary"
            isIconOnly
            disabled={count === "" || Number(count) === 1}
            onClick={() => setCount(Math.max(1, Number(count) - 1) + "")}
          >
            <Icon icon="ic:round-minus" width={24} height={24} />
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
            <Icon icon="ic:round-plus" width={24} height={24} />
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
