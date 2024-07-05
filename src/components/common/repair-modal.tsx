"use client";

import {
  ContractABIs,
  ContractAddresses,
  LDR,
  MinerTypeCount,
  TransactionConfirmBlockCount,
} from "@/config/constants";
import { getMinerIsApprovedForAll } from "@/lib/contracts/miner";
import { RootState } from "@/store";
import { IStakePosition } from "@/types";
import { Icon } from "@iconify/react";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { MainChain, wagmiConfig } from "@/config/web3.config";

type Props = {
  mine?: IStakePosition;
  lpr?: number;
  open: boolean;
  onClose: () => void;
  onRepairCompleted: () => void;
};

const RepairModal = ({
  mine,
  lpr,
  open,
  onClose,
  onRepairCompleted,
}: Props) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const miners = useSelector((state: RootState) => state.user.miners.balances);

  const [minerTypeId, setMinerTypeId] = useState(1);
  const [value, setValue] = useState("0");
  const [btnText, setBtnText] = useState("");

  const minerInfo = useSelector((state: RootState) => state.app.minerInfo);

  const repairRate = useMemo(
    () => minerInfo[minerTypeId].repairRate,
    [minerTypeId, minerInfo]
  );

  const count = useMemo(() => {
    if (value === "") return 0;
    return Number(value);
  }, [value]);

  const handleRepair = async () => {
    if (!address) return;
    try {
      const approved = await getMinerIsApprovedForAll(
        address,
        ContractAddresses.Staking
      );
      if (!approved) {
        setBtnText("Approving");
        const txHash = await writeContractAsync({
          abi: ContractABIs.Miner,
          address: ContractAddresses.Miner,
          functionName: "setApprovalForAll",
          args: [ContractAddresses.Staking, true],
        });
        await waitForTransactionReceipt(wagmiConfig, {
          chainId: MainChain.id,
          confirmations: TransactionConfirmBlockCount,
          hash: txHash,
        });
      }
      setBtnText("Repairing");
      const hash = await writeContractAsync({
        abi: ContractABIs.Staking,
        address: ContractAddresses.Staking,
        functionName: "repairNFT",
        args: [[mine?.tokenId], [minerTypeId], [count]],
      });
      await waitForTransactionReceipt(wagmiConfig, {
        chainId: MainChain.id,
        confirmations: TransactionConfirmBlockCount,
        hash,
      });
      onRepairCompleted();
    } catch (error: any) {
      console.error(
        "error",
        Object.keys(error).map((key) => error[key])
      );
    }
    setBtnText("");
  };

  const handleClose = useCallback(() => {
    if (btnText === "") {
      onClose();
    }
  }, [btnText, onClose]);

  if (!mine || lpr === undefined) return "";
  return (
    <Modal isOpen={open} onOpenChange={handleClose} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-[24px]">
          Claim Rewards
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>TokenId</span>
              <span>#{mine.tokenId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Type</span>
              <span>{mine.nftType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>LPR</span>
              <span>
                {lpr}
                {" → "}
                <span className="text-danger">{Math.max(0, lpr - LDR)}</span>
                {count > 0 ? (
                  <>
                    {" "}
                    →{" "}
                    <span className="text-primary">
                      {Math.min(
                        100,
                        Math.max(0, lpr - LDR) + count * repairRate
                      )}
                    </span>
                  </>
                ) : (
                  ""
                )}
              </span>
            </div>
            <div className="flex gap-3 justify-center pt-5">
              {new Array(MinerTypeCount).fill(0).map((_, ind) => (
                <Button
                  key={ind}
                  isIconOnly
                  onClick={() => setMinerTypeId(ind + 1)}
                  variant={ind + 1 === minerTypeId ? "solid" : "bordered"}
                  color="primary"
                >
                  {ind + 1}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span>Miner Balance</span>
              <span>
                {miners[minerTypeId]}
                {count > 0 ? (
                  <>
                    {" "}
                    →{" "}
                    <span className="text-danger">
                      {miners[minerTypeId] - count}
                    </span>
                  </>
                ) : (
                  ""
                )}
              </span>
            </div>
            <div className="flex items-center justify-between !mt-5">
              <div>Input miner balance</div>
              <div className="relative w-[140px]">
                <Input
                  type="number"
                  className="w-full"
                  min={0}
                  max={miners[minerTypeId]}
                  value={value}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setValue("");
                    } else {
                      setValue(
                        Math.min(miners[minerTypeId], Number(e.target.value)) +
                          ""
                      );
                    }
                  }}
                ></Input>
                <div className="flex gap-2 absolute top-1/2 right-3 -translate-y-1/2">
                  <button
                    disabled={value === "" || Number(value) === 0}
                    onClick={(e) => {
                      if (value !== "") {
                        setValue(Math.max(0, Number(value) - 1) + "");
                      }
                    }}
                  >
                    <Icon icon={"typcn:minus"} />
                  </button>
                  <button
                    disabled={
                      value === "" || Number(value) >= miners[minerTypeId]
                    }
                    onClick={(e) => {
                      if (value !== "") {
                        setValue(
                          Math.min(miners[minerTypeId], Number(value) + 1) + ""
                        );
                      }
                    }}
                  >
                    <Icon icon={"typcn:plus"} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={handleClose}>
            Close
          </Button>
          <Button
            color="primary"
            className="w-32 px-0 text-center"
            disabled={count === 0}
            onClick={handleRepair}
            isLoading={btnText !== ""}
          >
            {btnText === "" ? "Claim & Repair" : btnText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RepairModal;
