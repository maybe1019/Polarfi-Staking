import { DependencyDelayTime } from "@/config/constants";
import { getFrostStakingUserClaimableReward } from "@/lib/contracts/frost-staking-pool";
import { formatDate } from "@/lib/utils";
import { IStakingPool, IUserLock } from "@/types";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ForceUnlockConfirmModal from "./force-unlock-confirm-modal";

type Props = {
  pool: IStakingPool;
  userLock?: IUserLock;
  onLock: () => void;
  onUnlock: (force: boolean) => void;
  onClaim: () => void;
};

const FrostStakingPoolCard = ({
  pool,
  userLock,
  onLock,
  onClaim,
  onUnlock,
}: Props) => {
  const { address } = useAccount();

  const [reward, setReward] = useState(0);

  const [isLocking, setIsLocking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const loadReward = useCallback(async () => {
    if (!address || !userLock || !userLock.isActive) {
      setReward(0);
    } else {
      setReward(
        await getFrostStakingUserClaimableReward(pool.poolAddress, address)
      );
    }
  }, [pool, address, userLock]);

  useEffect(() => {
    const timerId = setTimeout(loadReward, DependencyDelayTime);
    return () => clearTimeout(timerId);
  }, [loadReward]);

  const handleClaim = async () => {
    setIsClaiming(true);
    await onClaim();
    loadReward();
    setIsClaiming(false);
  };

  const handleUnlock = async () => {
    if (!userLock) return;
    const now = new Date().getTime();
    if (now / 1000 < userLock.endTimestamp) {
      setIsConfirmModalOpen(true);
    } else {
      unlock(false);
    }
  };

  const handleLock = async () => {
    setIsLocking(true);
    await onLock();
    setIsLocking(false);
  };

  const unlock = async (force: boolean) => {
    setIsConfirmModalOpen(false);
    setIsUnlocking(true);
    await onUnlock(force);
    setIsUnlocking(false);
  };

  return (
    <div className="w-full bg-[#131924] rounded-xl overflow-hidden flex p-5 gap-5">
      <div className="bg-[#A0AECB] w-[300px] rounded-xl p-5">
        <Image
          src={pool.tokenImage}
          alt="token"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>
      <div className="grow flex flex-col justify-between gap-4">
        <div className="text-[32px] font-bold">{pool.poolName}</div>
        <div className="grid grid-cols-3 gap-5 my-auto">
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Lock Amount</span>
            <span className="text-[24px] font-bold">
              {pool.lockAmount} FROST
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Lock Period</span>
            <span className="text-[24px] font-bold">
              {pool.lockPeriod} Months
            </span>
          </div>
          <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
            <span className="text-white/50">Reward Token</span>
            <span className="text-[24px] font-bold">{pool.tokenSymbol}</span>
          </div>
          {userLock && userLock.isActive && (
            <>
              <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
                <span className="text-white/50">Started At</span>
                <span className="text-[20px] font-bold">
                  {formatDate(new Date(userLock.startTimestamp * 1000)).date}{" "}
                  {formatDate(new Date(userLock.startTimestamp * 1000)).time}
                </span>
              </div>
              <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
                <span className="text-white/50">Ends At</span>
                <span className="text-[20px] font-bold">
                  {formatDate(new Date(userLock.endTimestamp * 1000)).date}{" "}
                  {formatDate(new Date(userLock.endTimestamp * 1000)).time}
                </span>
              </div>
              <div className="flex items-center justify-between flex-col bg-[#191c2cb6] border-2 py-3 border-white/10 rounded-xl">
                <span className="text-white/50">Reward</span>
                <span className="text-[20px] font-bold">
                  {reward} {pool.tokenSymbol}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          {reward > 0 && (
            <Button
              color="primary"
              className="w-32"
              onClick={handleClaim}
              isLoading={isClaiming}
            >
              Claim
            </Button>
          )}
          {userLock && userLock.isActive ? (
            <Button
              color="danger"
              className="w-32"
              onClick={handleUnlock}
              isLoading={isUnlocking}
            >
              Unlock
            </Button>
          ) : (
            <Button
              color="primary"
              className="w-32"
              onClick={handleLock}
              isLoading={isLocking}
            >
              Lock
            </Button>
          )}
        </div>
      </div>
      <ForceUnlockConfirmModal
        open={isConfirmModalOpen}
        setOpen={setIsConfirmModalOpen}
        onUnlock={() => unlock(true)}
      />
    </div>
  );
};

export default FrostStakingPoolCard;
