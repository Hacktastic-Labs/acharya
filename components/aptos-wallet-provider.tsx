"use client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { useMemo } from "react";

export function AptosWalletProvider({ children }: { children: React.ReactNode }) {
  // Use an empty array; wallet-standard will auto-detect Petra, Martian, etc.
  const wallets = useMemo(() => [], []);
  return (
    <AptosWalletAdapterProvider wallets={wallets} autoConnect={false}>
      {children}
    </AptosWalletAdapterProvider>
  );
}