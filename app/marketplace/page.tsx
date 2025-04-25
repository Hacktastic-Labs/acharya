"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, FileText, BookOpen, X } from "lucide-react";
import { AptosWalletConnect } from "@/components/aptos-wallet-connect";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { KeylessProvider, useKeyless } from "@/components/aptos-keyless-context";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const sampleListings = [
  {
    id: 1,
    title: "Calculus Chapter 1 Notes",
    description: "Comprehensive notes covering limits, derivatives, and continuity.",
    price: 2.5,
    category: "Notes",
    uploader: "Aditi Sharma",
  },
  {
    id: 2,
    title: "Physics Formula Sheet",
    description: "All key formulas for Class 12 Physics in one place.",
    price: 0,
    category: "Formula Sheet",
    uploader: "Rahul Verma",
  },
  {
    id: 3,
    title: "Organic Chemistry Mindmap",
    description: "Visual mindmap for quick revision before exams.",
    price: 0.002,
    category: "Mindmap",
    uploader: "Priya Singh",
  },
];

function GoogleSignInButton() {
  const { keylessAccount, signInWithGoogle, signOut, loading, address } = useKeyless();
  if (keylessAccount) {
    return null;
  }
  return (
    <Button onClick={signInWithGoogle} variant="default" size="sm" disabled={loading}>
      {loading ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}

function WalletStatus() {
  const { connected, account, disconnect } = useWallet();
  const { keylessAccount, signOut, address: keylessAddress } = useKeyless();
  if (connected) {
    return (
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm">Wallet: <span className="font-mono">{account?.address?.toString()}</span></div>
        <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
      </div>
    );
  }
  if (keylessAccount) {
    return (
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm">Keyless: <span className="font-mono">{keylessAddress}</span></div>
        <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
      </div>
    );
  }
  return null;
}

function CreateListingModal({ open, onClose, disabled }: { open: boolean; onClose: () => void; disabled?: boolean }) {
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
        <p className="text-muted-foreground mb-4">Share your notes or study materials with the community.</p>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="listing-title">Title</label>
            <input id="listing-title" name="title" type="text" className="w-full rounded border px-3 py-2" placeholder="e.g. Calculus Chapter 1 Notes" required disabled={disabled} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="listing-desc">Description</label>
            <textarea id="listing-desc" name="description" className="w-full rounded border px-3 py-2" rows={2} placeholder="Brief description" required disabled={disabled} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="listing-category">Category</label>
            <select id="listing-category" name="category" className="w-full rounded border px-3 py-2" required disabled={disabled}>
              <option value="Notes">Notes</option>
              <option value="Formula Sheet">Formula Sheet</option>
              <option value="Mindmap">Mindmap</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="listing-file">Upload File</label>
            <input id="listing-file" name="file" type="file" className="w-full" required disabled={disabled} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="listing-price">Price (APT)</label>
            <input id="listing-price" name="price" type="number" min="0" step="0.01" className="w-full rounded border px-3 py-2" placeholder="Free or set your price" required disabled={disabled} />
          </div>
          <Button type="submit" className="w-full" variant="default" disabled={disabled}>
            {disabled ? "Connect Wallet to Create Listing" : "Create Listing (Demo Only)"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ListingDetailModal({ open, onClose, listing, onBuy, buying }: { open: boolean; onClose: () => void; listing: any; onBuy: () => void; buying?: boolean }) {
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
        <div className="mb-2 text-muted-foreground text-sm">Category: {listing.category}</div>
        <div className="mb-2 text-muted-foreground text-sm">Uploaded by: {listing.uploader}</div>
        <div className="mb-4 text-base">{listing.description}</div>
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold text-primary text-lg">
            {listing.price === 0 ? "Free" : `${listing.price} APT`}
          </span>
        </div>
        <Button className="w-full" onClick={onBuy} disabled={listing.price === 0 || buying}>
          {buying ? "Processing..." : (listing.price === 0 ? "Download (Coming Soon)" : `Buy for ${listing.price} APT`)}
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
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const { keylessAccount } = useKeyless();

  function handleViewBuy(listing: any) {
    setSelectedListing(listing);
    setDetailOpen(true);
  }

  async function handleBuy() {
    if (!selectedListing) return;
    setBuying(true);
    // Use a valid Aptos testnet address for demo (replace with real uploader address in production)
    const recipient = "0x1ecb02aa080e4eaf696222c19f12d4d4e486308043c874d0ff69b2142b0d0541";
    const amount = selectedListing.price;
    try {
      if (connected && account) {
        // Wallet adapter transaction (correct format)
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
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: keylessAccount, transaction: tx });
        alert("Transaction sent! Hash: " + committedTxn.hash);
      } else {
        alert("Not connected. Connect your wallet or sign in with Google.");
      }
      setDetailOpen(false);
    } catch (err: any) {
      alert("Transaction failed: " + (err.message || String(err)));
    } finally {
      setBuying(false);
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
              Browse and purchase notes, mindmaps, and other study materials uploaded by students. Share your own and earn!
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <WalletStatus />
            {!connected && !keylessAccount && <AptosWalletConnect />}
            {!connected && !keylessAccount && <GoogleSignInButton />}
            <Button size="lg" className="rounded-full" onClick={() => setModalOpen(true)} disabled={!connected && !keylessAccount}>
              <Plus className="h-5 w-5 mr-2" /> Create Listing
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleListings.map(listing => (
            <Card key={listing.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>{listing.title}</CardTitle>
                </div>
                <CardDescription>{listing.category} • Uploaded by {listing.uploader}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground mb-2">{listing.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="font-semibold text-primary">
                  {listing.price === 0 ? "Free" : `${listing.price} APT`}
                </span>
                <Button size="sm" variant="secondary" disabled={!connected && !keylessAccount} onClick={() => handleViewBuy(listing)}>
                  View / Buy
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <CreateListingModal open={modalOpen} onClose={() => setModalOpen(false)} disabled={!connected && !keylessAccount} />
      <ListingDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} listing={selectedListing} onBuy={handleBuy} buying={buying} />
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