"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import React from "react";
import IconPolarFiLogo from "../icons/icon-polarfi-logo";
import { Links } from "@/config/ui";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { ContractAddresses } from "@/config/constants";
import { MainChain } from "@/config/web3.config";
import { shortenAddress } from "@/lib/utils";
import { Button } from "@nextui-org/react";

const Header = () => {
  const { open } = useWeb3Modal();

  const { address, chainId } = useAccount();

  const { data: tokenBalance } = useBalance({
    address,
    token: ContractAddresses.Frost,
    chainId: MainChain.id,
    unit: "ether",
  });

  const onConnect = () => {
    if (!address) {
      open();
    } else if (chainId !== MainChain.id) {
      open({ view: "Networks" });
    } else {
      open();
    }
  };

  return (
    <header className="flex items-center px-4 md:px-10 h-16 md:h-20 gap-5 relative z-10 bg-black/40 backdrop-blur-sm">
      <Link href={"/"} className="mr-auto md:mr-0">
        <IconPolarFiLogo className="h-10 w-auto" />
      </Link>
      <nav className="md:flex items-center gap-8 mx-auto hidden">
        {Links.map((link, index) => (
          <Link href={link.href} key={index} className="text-[18px] uppercase">
            {link.label}
          </Link>
        ))}
      </nav>
      {tokenBalance?.value !== undefined && (
        <div className="hidden lg:block">
          Balance: {Number(tokenBalance?.formatted).toLocaleString()} $FROST
        </div>
      )}
      <Button onClick={onConnect} color="primary">
        {!address
          ? "Connect Wallet"
          : chainId !== MainChain.id
          ? "Wrong Network"
          : shortenAddress(address)}
      </Button>
    </header>
  );
};

export default Header;
