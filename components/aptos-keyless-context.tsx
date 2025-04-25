"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { EphemeralKeyPair, KeylessAccount, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { useMemo } from "react";

interface KeylessContextType {
  keylessAccount: KeylessAccount | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  loading: boolean;
  address: string | null;
}

const KeylessContext = createContext<KeylessContextType | undefined>(undefined);

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = typeof window !== "undefined" ? window.location.origin + "/marketplace" : "";

// Store as bytes (array), retrieve as Uint8Array and use fromBytes
function storeEphemeralKeyPair(ekp: EphemeralKeyPair) {
  const bytes = Array.from(ekp.bcsToBytes());
  localStorage.setItem("@aptos/ekp", JSON.stringify(bytes));
}
function getLocalEphemeralKeyPair(): EphemeralKeyPair | null {
  const ekp = localStorage.getItem("@aptos/ekp");
  if (!ekp) return null;
  const bytes = new Uint8Array(JSON.parse(ekp));
  return EphemeralKeyPair.fromBytes(bytes);
}
function storeKeylessAccount(account: KeylessAccount) {
  const bytes = Array.from(account.bcsToBytes());
  localStorage.setItem("@aptos/account", JSON.stringify(bytes));
}
function getLocalKeylessAccount(): KeylessAccount | null {
  const acc = localStorage.getItem("@aptos/account");
  if (!acc) return null;
  const bytes = new Uint8Array(JSON.parse(acc));
  return KeylessAccount.fromBytes(bytes);
}

export function KeylessProvider({ children }: { children: React.ReactNode }) {
  const [keylessAccount, setKeylessAccount] = useState<KeylessAccount | null>(null);
  const [loading, setLoading] = useState(false);

  // On mount, check for account in localStorage
  useEffect(() => {
    const acc = getLocalKeylessAccount();
    if (acc) setKeylessAccount(acc);
  }, []);

  // Handle Google OIDC callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("id_token")) {
      setLoading(true);
      const params = new URLSearchParams(hash.substring(1));
      const jwt = params.get("id_token");
      const ekp = getLocalEphemeralKeyPair();
      if (!jwt || !ekp) {
        setLoading(false);
        return;
      }
      // Derive KeylessAccount
      const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
      aptos.deriveKeylessAccount({ jwt, ephemeralKeyPair: ekp })
        .then((account) => {
          setKeylessAccount(account);
          storeKeylessAccount(account);
          // Remove id_token from URL
          window.location.hash = "";
        })
        .finally(() => setLoading(false));
    }
  }, []);

  function signInWithGoogle() {
    const ekp = EphemeralKeyPair.generate();
    storeEphemeralKeyPair(ekp);
    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${ekp.nonce}&redirect_uri=${REDIRECT_URI}&client_id=${GOOGLE_CLIENT_ID}`;
    window.location.href = loginUrl;
  }

  function signOut() {
    setKeylessAccount(null);
    localStorage.removeItem("@aptos/account");
  }

  return (
    <KeylessContext.Provider value={{ keylessAccount, signInWithGoogle, signOut, loading, address: keylessAccount?.accountAddress?.toString() || null }}>
      {children}
    </KeylessContext.Provider>
  );
}

export function useKeyless() {
  const ctx = useContext(KeylessContext);
  if (!ctx) throw new Error("useKeyless must be used within KeylessProvider");
  return ctx;
}

export function AptosWalletProvider({ children }: { children: React.ReactNode }) {
  // Do not pass wallets prop; wallet-standard will auto-detect Petra, Martian, etc.
  return (
    <AptosWalletAdapterProvider autoConnect={false}>
      {children}
    </AptosWalletAdapterProvider>
  );
} 