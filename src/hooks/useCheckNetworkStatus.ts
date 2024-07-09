import { Messages } from "@/config/constants";
import { MainChain } from "@/config/web3.config";
import { NetworkStatus } from "@/types/enums";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

const useCheckNetworkStatus = () => {
  const { address, chainId } = useAccount();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const networkStatus = useMemo(() => {
    if (!address) {
      return NetworkStatus.NotConnected;
    }

    if (chainId !== MainChain.id) {
      return NetworkStatus.WrongNetwork;
    }

    return NetworkStatus.Success;
  }, [address, chainId]);

  const checkNetworkStatus = useCallback(() => {
    if (networkStatus === NetworkStatus.NotConnected) {
      toast.warn(Messages.ConnectWallet);
      return false;
    }

    if (networkStatus === NetworkStatus.WrongNetwork) {
      toast.warn(Messages.WrongNetwork);
      return false;
    }

    return true;
  }, [networkStatus]);

  return { checkNetworkStatus, networkStatus };
};

export default useCheckNetworkStatus;
