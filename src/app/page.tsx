"use client";

import { Button } from "@nextui-org/button";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Checkbox,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import useTokenAllowance from "@/hooks/useTokenAllowance";
import {
  ContractABIs,
  ContractAddresses,
  DependencyDelayTime,
  MineTypeCount,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEther } from "viem";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import useMineBalanceOf from "@/hooks/useMineBalanceOf";
import { RootState, useAppDispatch } from "@/store";
import { loadMineInfoThunk } from "@/store/reducers/appReducer";
import { useSelector } from "react-redux";
import { addNewMinesThunk } from "@/store/reducers/userReducer";
import UserNFTs from "@/components/common/user-nfts";

export default function Home() {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const mineInfo = useSelector((state: RootState) => state.app.mineInfo);
  const userMines = useSelector((state: RootState) => state.user.mines);

  const [typeId, setTypeId] = useState(1);
  const [count, setCount] = useState("1");
  const [btnLabel, setBtnLabel] = useState("");

  const price = useMemo(() => mineInfo[typeId].price, [mineInfo, typeId]);
  const amountForSale = useMemo(
    () => mineInfo[typeId].amountForSale,
    [mineInfo, typeId]
  );

  const { allowanceInNumber, loadAllowance } = useTokenAllowance(
    ContractAddresses.Frost,
    address,
    ContractAddresses.Mine
  );

  const handleMint = async () => {
    const cnt = Number(count);
    if (!address) {
      return;
    }

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
          confirmations: TransactionConfirmBlockCount,
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
    <div className="space-y-16">
      <div className="flex items-center justify-center gap-10 grow">
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
          <div>Price: {mineInfo[typeId].price} $FROST</div>
          <div>
            Balance: {userMines.data.filter((m) => m.nftType === typeId).length}
          </div>
          <div>Available: {mineInfo[typeId].amountForSale}</div>
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
      <UserNFTs />
    </div>
  );
}
