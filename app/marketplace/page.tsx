"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Plus, FileText, BookOpen, X, Copy, ChevronDown } from "lucide-react";
import { AptosWalletConnect } from "@/components/aptos-wallet-connect";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  KeylessProvider,
  useKeyless,
} from "@/components/aptos-keyless-context";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Utility to shorten wallet address (move to top-level scope)
function shortAddress(addr: string) {
  if (!addr) return "";
  if (addr.startsWith("0x") && addr.length > 6) return addr.slice(0, 4) + "..";
  if (addr.length > 6) return addr.slice(0, 2) + "..";
  return addr;
}

function GoogleSignInButton() {
  const { keylessAccount, signInWithGoogle, signOut, loading, address } =
    useKeyless();
  if (keylessAccount) {
    return null;
  }
  return (
    <Button
      onClick={signInWithGoogle}
      variant="default"
      size="sm"
      disabled={loading}
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}

function WalletStatus() {
  const { connected, account, disconnect } = useWallet();
  const { keylessAccount, signOut, address: keylessAddress } = useKeyless();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Copy to clipboard
  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (connected && account) {
    return (
      <div className="mb-2 flex items-center gap-2 relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded bg-muted hover:bg-accent text-sm font-mono border border-border"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          {shortAddress(account.address.toString())}
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-background border rounded shadow-lg z-50">
            <div className="px-4 py-2 text-xs text-muted-foreground">{account.address.toString()}</div>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm"
              onClick={() => copyAddress(account.address.toString())}
            >
              <Copy className="h-4 w-4" /> Copy Address
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm text-red-600"
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }
  if (keylessAccount) {
    return (
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm">
          Keyless: <span className="font-mono">{shortAddress(keylessAddress || "")}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    );
  }
  return null;
}

function CreateListingModal({
  open,
  onClose,
  disabled,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
  onSubmit?: (e: any) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Plus className="h-6 w-6 text-primary" /> Create Listing
        </h2>
        <p className="text-muted-foreground mb-4">
          Share your notes or study materials with the community.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="listing-title"
            >
              Title
            </label>
            <input
              id="listing-title"
              name="title"
              type="text"
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Calculus Chapter 1 Notes"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="listing-desc"
            >
              Description
            </label>
            <textarea
              id="listing-desc"
              name="description"
              className="w-full rounded border px-3 py-2"
              rows={2}
              placeholder="Brief description"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="listing-category"
            >
              Category
            </label>
            <select
              id="listing-category"
              name="category"
              className="w-full rounded border px-3 py-2"
              required
              disabled={disabled}
            >
              <option value="Notes">Notes</option>
              <option value="Formula Sheet">Formula Sheet</option>
              <option value="Mindmap">Mindmap</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="listing-file"
            >
              Upload File
            </label>
            <input
              id="listing-file"
              name="file"
              type="file"
              className="w-full"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="listing-price"
            >
              Price (APT)
            </label>
            <input
              id="listing-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              placeholder="Free or set your price"
              required
              disabled={disabled}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="default"
            disabled={disabled}
          >
            {disabled ? "Connect Wallet to Create Listing" : "Create Listing"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ListingDetailModal({
  open,
  onClose,
  listing,
  onBuy,
  buying,
}: {
  open: boolean;
  onClose: () => void;
  listing: any;
  onBuy: () => void;
  buying?: boolean;
}) {
  if (!open || !listing) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> {listing.title}
        </h2>
        <div className="mb-2 text-muted-foreground text-sm">
          Category: {listing.category}
        </div>
        <div className="mb-2 text-muted-foreground text-sm">
          Uploaded by: {shortAddress(listing.uploader || "")}
        </div>
        <div className="mb-4 text-base">{listing.description}</div>
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold text-primary text-lg">
            {listing.price === 0 ? "Free" : `${listing.price} APT`}
          </span>
        </div>
        <Button
          className="w-full"
          onClick={onBuy}
          disabled={listing.price === 0 || buying}
        >
          {buying
            ? "Processing..."
            : listing.price === 0
            ? "Download (Coming Soon)"
            : `Buy for ${listing.price} APT`}
        </Button>
      </div>
    </div>
  );
}

function MarketplaceContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const { keylessAccount } = useKeyless();

  useEffect(() => {
    fetch("/api/marketplace")
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []));
  }, []);

  useEffect(() => {
    const address =
      account?.address?.toString() || keylessAccount?.accountAddress;
    if (address) {
      fetch(`/api/purchase?address=${address}`)
        .then((res) => res.json())
        .then((data) => setPurchases(data.purchases || []));
    }
  }, [account, keylessAccount]);

  function handleViewBuy(listing: any) {
    setSelectedListing(listing);
    setDetailOpen(true);
  }

  async function handleBuy() {
    if (!selectedListing) return;
    setBuying(true);
    const recipient =
      "0x1ecb02aa080e4eaf696222c19f12d4d4e486308043c874d0ff69b2142b0d0541";
    const amount = selectedListing.price;
    const address =
      account?.address?.toString() || keylessAccount?.accountAddress;
    try {
      if (connected && account) {
        const response = await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [recipient, (amount * 1e8).toString()],
          },
        });
        alert("Transaction sent! Hash: " + response.hash);
      } else if (keylessAccount) {
        const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
        const tx = await aptos.transferCoinTransaction({
          sender: keylessAccount.accountAddress,
          recipient,
          amount: amount * 1e8,
        });
        const committedTxn = await aptos.signAndSubmitTransaction({
          signer: keylessAccount,
          transaction: tx,
        });
        alert("Transaction sent! Hash: " + committedTxn.hash);
      } else {
        alert("Not connected. Connect your wallet or sign in with Google.");
      }
      // Record purchase in DB
      if (address) {
        await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            listing_id: selectedListing.id,
          }),
        });
        // Refresh purchases
        fetch(`/api/purchase?address=${address}`)
          .then((res) => res.json())
          .then((data) => setPurchases(data.purchases || []));
      }
      setDetailOpen(false);
    } catch (err: any) {
      alert("Transaction failed: " + (err.message || String(err)));
    } finally {
      setBuying(false);
    }
  }

  async function handleCreateListing(e: any) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Append uploader address to FormData
    const uploaderValue =
      account?.address?.toString() ||
      keylessAccount?.accountAddress?.toString() ||
      "Anonymous";
    formData.append("uploader", uploaderValue);

    // Send FormData directly to /api/marketplace
    const res = await fetch("/api/marketplace", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setModalOpen(false);
      // Refresh listings
      fetch("/api/marketplace")
        .then((res) => res.json())
        .then((data) => setListings(data.listings || []));
    } else {
      alert("Failed to create listing");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" /> Marketplace
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Browse and purchase notes, mindmaps, and other study materials
              uploaded by students. Share your own and earn!
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <WalletStatus />
            {!(connected || keylessAccount) && (
              <div className="flex flex-row gap-2 w-full justify-end">
                <AptosWalletConnect />
                <GoogleSignInButton />
              </div>
            )}
            <Button
              size="lg"
              className="rounded-full"
              onClick={() => setModalOpen(true)}
              disabled={!connected && !keylessAccount}
            >
              <Plus className="h-5 w-5 mr-2" /> Create Listing
            </Button>
          </div>
        </div>

        {/* My Purchases Section */}
        {(account?.address || keylessAccount?.accountAddress) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Purchases</h2>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground">
                You haven't bought anything yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {purchases.map((listing) => (
                  <Card key={listing.id} className="flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>{listing.title}</CardTitle>
                      </div>
                      <CardDescription>
                        {listing.category} • Uploaded by{" "}
                        {shortAddress(listing.uploader || "")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground mb-2">
                        {listing.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {listing.price === "0"
                          ? "Free"
                          : `${listing.price} APT`}
                      </span>
                      {listing.file_url && (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={listing.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View PDF
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <Card key={listing.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>{listing.title}</CardTitle>
                </div>
                <CardDescription>
                  {listing.category} • Uploaded by{" "}
                  {shortAddress(listing.uploader || "")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground mb-2">
                  {listing.description}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="font-semibold text-primary">
                  {listing.price === "0" ? "Free" : `${listing.price} APT`}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!connected && !keylessAccount}
                  onClick={() => handleViewBuy(listing)}
                >
                  View / Buy
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <CreateListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disabled={!connected && !keylessAccount}
        onSubmit={handleCreateListing}
      />
      <ListingDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        listing={selectedListing}
        onBuy={handleBuy}
        buying={buying}
      />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <KeylessProvider>
      <MarketplaceContent />
    </KeylessProvider>
  );
}
