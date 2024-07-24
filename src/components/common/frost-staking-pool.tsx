import { DependencyDelayTime } from "@/config/constants";
import { IStakingPool, IUserLock } from "@/types";
import { Button } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getFrostStakingUserClaimableReward } from "@/lib/contracts/frost-staking-pool";
import ForceUnlockConfirmModal from "./force-unlock-confirm-modal";

type Props = {
  pool: IStakingPool;
  userLock?: IUserLock;
  onLock: () => void;
  onUnlock: (force: boolean) => void;
  onClaim: () => void;
};

const FrostStakingPool = ({
  pool,
  userLock,
  onLock,
  onClaim,
  onUnlock,
}: Props) => {
  const { address } = useAccount();
  const [isLocking, setIsLocking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [reward, setReward] = useState(0);

  const loadReward = useCallback(async () => {
    if (!address) {
      setReward(0);
    } else {
      setReward(
        await getFrostStakingUserClaimableReward(pool.poolAddress, address)
      );
    }
  }, [pool, address]);

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
    <>
      <tr className={`[&>td]:py-2`}>
        <td className="rounded-l-md text-left">{pool.poolName}</td>
        <td className="">{pool.lockAmount} FROST</td>
        <td className="">{pool.lockPeriod} Months</td>
        <td className="">
          {reward} {pool.tokenSymbol}
        </td>
        <td className="text-right">
          <div className="flex justify-end gap-4">
            {userLock?.isActive ? (
              <>
                {reward > 0 ? (
                  <Button
                    onClick={handleClaim}
                    isLoading={isClaiming}
                    color="primary"
                  >
                    Claim
                  </Button>
                ) : (
                  ""
                )}{" "}
                <Button
                  onClick={handleUnlock}
                  isLoading={isUnlocking}
                  color="danger"
                >
                  Unlock
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                onClick={handleLock}
                isLoading={isLocking}
                isDisabled={!Boolean(address) || userLock?.isActive}
              >
                Lock
              </Button>
            )}
          </div>
        </td>
      </tr>
      <ForceUnlockConfirmModal
        open={isConfirmModalOpen}
        setOpen={setIsConfirmModalOpen}
        onUnlock={() => unlock(true)}
      />
    </>
  );
};

export default FrostStakingPool;
