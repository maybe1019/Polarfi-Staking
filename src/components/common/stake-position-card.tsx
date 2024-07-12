import {
  ContractABIs,
  ContractAddresses,
  Messages,
  MineNames,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";
import { formatDate } from "@/lib/utils";
import { IStakePosition, IStakeReward } from "@/types";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import { useAppDispatch } from "@/store";
import {
  loadUserMinesThunk,
  loadUserStakePositionsThunk,
} from "@/store/reducers/userReducer";
import { toast } from "react-toastify";
import RepairModal from "./repair-modal";

type Props = {
  position: IStakePosition;
  reward?: IStakeReward;
  loadRewards: () => void;
};

const StakePositionCard = ({ position, reward, loadRewards }: Props) => {
  const { checkNetworkStatus } = useCheckNetworkStatus();
  const { writeContractAsync } = useWriteContract();
  const dispatch = useAppDispatch();
  const { address } = useAccount();

  const [unstaking, setUnstaking] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const handleClaim = async () => {
    if (!checkNetworkStatus()) {
      return;
    }

    setClaiming(true);
    try {
      const txHash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "claimRewards",
        args: [[position.tokenId]],
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: txHash,
      });

      toast.success(Messages.Success);
      loadRewards();
      dispatch(loadUserStakePositionsThunk({ address }));
    } catch (error) {
      console.error("handleClaim", error);
      toast.error(Messages.TransactionRejected);
    }

    setClaiming(false);
  };

  const handleUnstake = async () => {
    if (!checkNetworkStatus()) {
      return;
    }

    setUnstaking(true);

    try {
      const hash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "unstakeNFT",
        args: [[position.tokenId]],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash,
      });

      toast.success(Messages.Success);
      loadRewards();
      dispatch(loadUserStakePositionsThunk({ address }));
    } catch (error: any) {
      console.error(
        "handleUnstake",
        Object.keys(error).map((key) => error[key])
      );
      toast.error(Messages.TransactionRejected);
    }

    setUnstaking(false);
  };
  return (
    <div className="bg-[#131924] rounded-xl overflow-hidden flex p-5 gap-5">
      <div className="bg-[#A0AECB] w-[330px] rounded-xl">
        <Image
          src={`/imgs/mines/${position.nftType}.gif`}
          alt="mine"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>
      <div className="grow flex flex-col">
        <div className="text-[32px] font-bold">
          {MineNames[position.nftType]} #{position.tokenId}
        </div>
        <div className="grid grid-cols-3 gap-5 my-auto">
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Buy Price</span>
            <span className="text-[24px] font-bold">
              {position.buyPrice} $FROST
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Staked At</span>
            <span className="text-[24px] font-bold">
              {formatDate(new Date(position.stakedTimestamp)).date}{" "}
              {formatDate(new Date(position.stakedTimestamp)).time}
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Last Claim</span>
            <span className="text-[24px] font-bold">
              {formatDate(new Date(position.latestClaimedTimestamp)).date}{" "}
              {formatDate(new Date(position.latestClaimedTimestamp)).time}
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Claimed Reward</span>
            <span className="text-[24px] font-bold">
              {position.claimedRewards} $FROST
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Claimable Reward</span>
            <span className="text-[24px] font-bold">
              {reward?.reward.toLocaleString()} $FROST
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">LPR</span>
            <span className="text-[24px] font-bold">{reward?.currentLPR}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            color="primary"
            onClick={handleClaim}
            disabled={!reward?.reward}
            isLoading={claiming}
          >
            Claim
          </Button>
          <Button color="primary" onClick={() => setModalOpen(true)}>
            Claim & Repair
          </Button>
          <Button color="danger" onClick={handleUnstake} isLoading={unstaking}>
            Unstake
          </Button>
        </div>
      </div>
      <RepairModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mine={position}
        lpr={reward?.currentLPR}
        onRepairCompleted={() => {
          setModalOpen(false);
          loadRewards();
          dispatch(loadUserStakePositionsThunk({ address }));
        }}
      />
    </div>
  );
};

export default StakePositionCard;
