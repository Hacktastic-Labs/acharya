"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";

export function AptosWalletConnect() {
  const { connect, disconnect, account, connected, wallets } = useWallet();

  // Debug: show detected wallets
  console.log("Aptos detected wallets:", wallets);

  return (
    <div className="mb-4">
      {connected ? (
        <div>
          <div className="mb-2 text-sm">
            Connected: <span className="font-mono">{account?.address?.toString()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            const petra = wallets.find(w => w.name === "Petra");
            if (petra) {
              connect(petra.name);
            } else {
              alert("Petra wallet not found. Please install Petra or another Aptos wallet.");
            }
          }}
          variant="default"
          size="sm"
        >
          Connect Aptos Wallet
        </Button>
      )}
    </div>
  );
} 