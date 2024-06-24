import { ContractABIs, ContractAddresses } from "@/config/constants";
import { getMineAllowance } from "@/hooks/useMineAllowance";
import useMineTokensOf from "@/hooks/useMineTokensOf";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { MainChain, wagmiConfig } from "@/config/web3.config";

type Props = {
  open: boolean;
  onStakeCompleted: () => void;
  setOpen: (open: boolean) => void;
};

const StakeModal = ({ open, setOpen, onStakeCompleted }: Props) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState("");

  const { tokens, loadTokens: loadMineTokensOf } = useMineTokensOf(address);

  const handleStake = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const allowance = await getMineAllowance(
        address,
        ContractAddresses.Staking
      );
      console.log("allowance", address, ContractAddresses.Staking, allowance);
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
          confirmations: 1,
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
        confirmations: 1,
        hash: txHash,
      });

      loadMineTokensOf();
      onStakeCompleted();
      setOpen(false);
    } catch (error) {
      console.error("handleStake", error);
    }
    setLoading(false);
    setBtnLabel("");
  };

  return (
    <Modal isOpen={open} onOpenChange={setOpen} size="3xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-[24px]">
          Stake MINE
        </ModalHeader>
        <ModalBody>
          {tokens.length > 0 ? (
            <>
              <div className="flex">
                <span>Total: {tokens.length} NFTs</span>
                <span className="ml-auto">
                  {selectedTokenIds.length} NFTs selected
                </span>
              </div>
              <div className="max-h-[calc(100vh-320px)] w-[calc(100%+10px)] pr-[10px] overflow-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {tokens
                    .sort((a, b) => a.tokenId - b.tokenId)
                    .map((token) => (
                      <div
                        key={token.tokenId}
                        className={`rounded-xl transition-all aspect-[0.7] p-4 flex flex-col items-center cursor-pointer border relative ${
                          selectedTokenIds.includes(token.tokenId)
                            ? "border-blue-300 opacity-100 bg-blue-900"
                            : "border-transparent opacity-60 hover:opacity-80 bg-blue-950"
                        }`}
                        onClick={() => {
                          if (selectedTokenIds.includes(token.tokenId)) {
                            setSelectedTokenIds((prev) =>
                              prev.filter((t) => t !== token.tokenId)
                            );
                          } else {
                            setSelectedTokenIds((prev) => [
                              ...prev,
                              token.tokenId,
                            ]);
                          }
                        }}
                      >
                        {selectedTokenIds.includes(token.tokenId) && (
                          <Icon
                            icon="pajamas:check"
                            className="right-3 top-3 absolute"
                          />
                        )}
                        <div className="my-auto text-[32px] font-bold">
                          #{token.tokenId}
                        </div>
                        <div className="w-full flex items-center justify-between text-[14px]">
                          <span className="text-slate-400">TypeID</span>
                          <span>{token.typeId}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-[32px] font-semibold text-slate-400 text-center py-32">
              You have no NFTs.
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {tokens.length === 0 ? (
            ""
          ) : selectedTokenIds.length !== tokens.length ? (
            <Button
              variant="light"
              color="primary"
              className="mr-auto"
              onClick={() =>
                setSelectedTokenIds(tokens.map((token) => token.tokenId))
              }
            >
              Select All
            </Button>
          ) : (
            <Button
              variant="light"
              color="primary"
              className="mr-auto"
              onClick={() => setSelectedTokenIds([])}
            >
              Deselect All
            </Button>
          )}
          <Button color="danger" variant="light" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            color="primary"
            onClick={handleStake}
            isLoading={loading}
            disabled={selectedTokenIds.length === 0 || loading}
            className="w-28 px-0 text-center"
          >
            {loading ? btnLabel : "Stake"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StakeModal;
