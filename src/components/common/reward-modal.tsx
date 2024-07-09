import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { IStakeReward } from "@/types";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";
import {
  ContractABIs,
  ContractAddresses,
  Messages,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import useCheckNetworkStatus from "@/hooks/useCheckNetworkStatus";
import { toast } from "react-toastify";

type Props = {
  rewards: IStakeReward[];
  open: boolean;
  onStakeCompleted: () => void;
  setOpen: (open: boolean) => void;
};

const RewardModal = ({ rewards, open, setOpen, onStakeCompleted }: Props) => {
  const { writeContractAsync } = useWriteContract();
  const { checkNetworkStatus } = useCheckNetworkStatus();

  const [claiming, setClaiming] = useState(false);

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
        args: [rewards.map((r) => r.tokenId)],
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash: txHash,
      });

      onStakeCompleted();
      toast.success(Messages.Success);
      setOpen(false);
    } catch (error) {
      console.error("handleClaim", error);
      toast.error(Messages.TransactionRejected);
    }

    setClaiming(false);
  };

  return (
    <Modal isOpen={open} onOpenChange={setOpen} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-[24px]">
          Claim Rewards
        </ModalHeader>
        <ModalBody>
          {rewards
            .sort((a, b) => a.tokenId - b.tokenId)
            .map((reward, index) => (
              <div className="flex items-center justify-between" key={index}>
                <span>MINE #{reward.tokenId}</span>
                <span className={reward.reward === 0 ? "text-danger" : ""}>
                  {reward.reward.toLocaleString()}
                </span>
              </div>
            ))}
          <div className="w-full h-[1px] bg-stone-200"></div>
          <div className="flex justify-between">
            <span>Total</span>
            <span>
              {rewards
                .reduce((prev, cur) => prev + cur.reward, 0)
                .toLocaleString()}
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            color="primary"
            className="w-28 px-0 text-center"
            isLoading={claiming}
            onClick={handleClaim}
          >
            Claim
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RewardModal;
