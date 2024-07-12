import {
  ContractABIs,
  ContractAddresses,
  Messages,
  MineNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getMineAllowance } from "@/lib/contracts/mine";
import { formatDate } from "@/lib/utils";
import { RootState, useAppDispatch } from "@/store";
import { LoadingStatus } from "@/types/enums";
import { Button, Checkbox, Spinner, TableCell } from "@nextui-org/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { removeNFTs } from "@/store/reducers/userReducer";
import Image from "next/image";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";
import { toast } from "react-toastify";

const UserNFTs = () => {
  const dispatch = useAppDispatch();
  const userMines = useSelector((state: RootState) => state.user.mines);
  const userStakePositions = useSelector(
    (state: RootState) => state.user.stakePositions
  );
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { checkNetworkStatus } = useCheckNetworkStatus();

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState("");

  const handleStake = async () => {
    if (!checkNetworkStatus()) {
      return;
    }
    if (!address) return;
    setLoading(true);
    try {
      const allowance = await getMineAllowance(
        address,
        ContractAddresses.Staking
      );
      if (!allowance) {
        setBtnLabel("Approving...");
        const txHash = await writeContractAsync({
          abi: ContractABIs.Mine,
          address: ContractAddresses.Mine,
          functionName: "setApprovalForAll",
          args: [ContractAddresses.Staking, true],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
      }

      setBtnLabel("Staking...");
      const txHash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "stakeNFT",
        args: [selectedTokenIds],
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: txHash,
      });

      dispatch(removeNFTs(selectedTokenIds));
      setSelectedTokenIds([]);
      toast.success(Messages.Success);
    } catch (error: any) {
      console.error(
        "handleStake",
        Object.keys(error).map((key) => error[key])
      );
      toast.error(Messages.TransactionRejected);
    }
    setLoading(false);
    setBtnLabel("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-end gap-5">
          <div className="px-5 py-2 bg-[#141925] uppercase border-2 rounded-[10px] border-[#2a2e3f]">
            In Wallet: {userMines.data.length}
          </div>
          <div className="px-5 py-2 bg-[#141925] uppercase border-2 rounded-[10px] border-[#2a2e3f]">
            Staked: {userStakePositions.data.length}
          </div>
          <div className="px-5 py-2 bg-[#141925] uppercase border-2 rounded-[10px] border-[#2a2e3f]">
            Total: {userMines.data.length + userStakePositions.data.length}
          </div>
        </div>
        <div>
          <Button
            color="primary"
            onClick={handleStake}
            isLoading={loading}
            disabled={selectedTokenIds.length === 0 || loading}
            className="w-28 px-0 text-center"
          >
            {loading ? btnLabel : "Stake"}
          </Button>
        </div>
      </div>

      <div className="bg-[#131823] rounded-xl px-4 text-[18px]">
        <table className="w-full">
          <thead>
            <tr className="text-left [&>th]:py-4">
              <th className="w-10 text-center">
                <Checkbox
                  isSelected={
                    selectedTokenIds.length > 0 &&
                    selectedTokenIds.length === userMines.data.length
                  }
                  isIndeterminate={
                    selectedTokenIds.length > 0 &&
                    selectedTokenIds.length !== userMines.data.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTokenIds(userMines.data.map((p) => p.tokenId));
                    } else {
                      setSelectedTokenIds([]);
                    }
                  }}
                ></Checkbox>
              </th>
              <th>Name</th>
              <th>Token Id</th>
              <th>Buy Price</th>
              <th>Staked At</th>
              <th>Last Claim</th>
              <th>Claimed Reward</th>
              <th>Latest LPR</th>
            </tr>
          </thead>
          <tbody>
            {userMines.data.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  aria-colspan={6}
                  className="text-center py-20 text-stone-400"
                >
                  {userMines.status !== LoadingStatus.Fulfilled ? (
                    <Spinner />
                  ) : (
                    "No MINE NFTs"
                  )}
                </td>
              </tr>
            ) : (
              userMines.data
                .map((a) => a)
                .sort((a, b) => a.tokenId - b.tokenId)
                .map((mine, ind) => (
                  <tr
                    key={mine.tokenId}
                    className={`group [&>td]:transition-all cursor-pointer [&>td]:py-2 ${
                      selectedTokenIds.includes(mine.tokenId)
                        ? "[&>td]:bg-primary/20"
                        : ""
                    }`}
                    onClick={() => {
                      if (selectedTokenIds.includes(mine.tokenId)) {
                        setSelectedTokenIds((prev) =>
                          prev.filter((t) => t !== mine.tokenId)
                        );
                      } else {
                        setSelectedTokenIds((prev) => [...prev, mine.tokenId]);
                      }
                    }}
                  >
                    <td className="rounded-l-md group-hover:bg-primary/10 text-center">
                      <Checkbox
                        isSelected={selectedTokenIds.includes(mine.tokenId)}
                        onClick={() => {
                          if (selectedTokenIds.includes(mine.tokenId)) {
                            setSelectedTokenIds((prev) =>
                              prev.filter((t) => t !== mine.tokenId)
                            );
                          } else {
                            setSelectedTokenIds((prev) => [
                              ...prev,
                              mine.tokenId,
                            ]);
                          }
                        }}
                      ></Checkbox>
                    </td>
                    <td className="group-hover:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/imgs/mines/${mine.nftType}.png`}
                          alt="mine"
                          width={1000}
                          height={1000}
                          className="w-10 h-10 rounded-md"
                        />
                        <span>{MineNames[mine.nftType]}</span>
                      </div>
                    </td>
                    <td className="group-hover:bg-primary/10">
                      #{mine.tokenId}
                    </td>
                    <td className="group-hover:bg-primary/10">
                      {mine.buyPrice}
                    </td>
                    <td className="group-hover:bg-primary/10">
                      {mine.stakedTimestamp === 0
                        ? "-"
                        : `${formatDate(new Date(mine.stakedTimestamp)).date} ${
                            formatDate(new Date(mine.stakedTimestamp)).time
                          }`}
                    </td>
                    <td className="group-hover:bg-primary/10">
                      {mine.claimedRewards === 0
                        ? "-"
                        : `${
                            formatDate(new Date(mine.latestClaimedTimestamp))
                              .date
                          } ${
                            formatDate(new Date(mine.latestClaimedTimestamp))
                              .time
                          }`}
                    </td>
                    <td className="group-hover:bg-primary/10">
                      {mine.claimedRewards}
                    </td>
                    <td
                      className={`group-hover:bg-primary/10 rounded-r-md ${
                        mine.latestLpr === 0
                          ? "text-danger"
                          : mine.latestLpr < 80
                          ? "text-primary"
                          : "text-success"
                      }`}
                    >
                      {mine.latestLpr / 100}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserNFTs;
