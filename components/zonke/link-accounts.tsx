"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Check, Lock, ShieldCheck, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Store = {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
};

const stores: Store[] = [
  {
    id: "tfg",
    name: "TFG",
    color: "#3b82f6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/TFG_Limited_Logo.svg/250px-TFG_Limited_Logo.svg.png",
  },
  {
    id: "truworths",
    name: "Truworths",
    color: "#8b5cf6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Truworths_Logo.jpg",
  },
  {
    id: "ackermans",
    name: "Ackermans",
    color: "#14b8a6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ackermans_Logo.svg/250px-Ackermans_Logo.svg.png",
  },
];

// Store Logo Components
const StoreLogo = ({ store, size = "lg" }: { store: Store; size?: "sm" | "lg" }) => {
  const sizeClass = size === "lg" ? "w-16 h-16" : "w-10 h-10";

  if (store.logoUrl) {
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-xl bg-white p-2 shadow-sm`}>
        <img
          src={store.logoUrl}
          alt={`${store.name} logo`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center font-bold text-white bg-indigo-500 rounded-xl`}>
      {store.name.charAt(0)}
    </div>
  );
};

interface Credentials {
  [key: string]: { username: string; password: string };
}

interface CardInfo {
  [key: string]: { name: string; id: string; cardNumber: string };
}

const speakCardName = (cardName: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`You have added ${cardName} smart card`);
  window.speechSynthesis.speak(utterance);
};

export function LinkAccounts() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [customStores, setCustomStores] = useState<Store[]>([]);
  const [credentials, setCredentials] = useState<Credentials>({});
  const [cardInfo, setCardInfo] = useState<CardInfo>({});
  const [hasLoadedStoredData, setHasLoadedStoredData] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordId, setForgotPasswordId] = useState("");
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalId, setCardModalId] = useState<string | null>(null);
  const [tempCardName, setTempCardName] = useState("");
  const [tempCardId, setTempCardId] = useState("");
  const [tempCardNumber, setTempCardNumber] = useState("");

  const allStores = useMemo(() => [...stores, ...customStores], [customStores]);

  useEffect(() => {
    const savedCardInfo = window.localStorage.getItem("zonke-card-info");
    const savedCustomStores = window.localStorage.getItem("zonke-custom-stores");

    try {
      if (savedCardInfo) {
        setCardInfo(JSON.parse(savedCardInfo));
      }

      if (savedCustomStores) {
        setCustomStores(JSON.parse(savedCustomStores));
      }
    } finally {
      setHasLoadedStoredData(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredData) {
      return;
    }

    window.localStorage.setItem("zonke-card-info", JSON.stringify(cardInfo));
  }, [cardInfo, hasLoadedStoredData]);

  useEffect(() => {
    if (!hasLoadedStoredData) {
      return;
    }

    window.localStorage.setItem("zonke-custom-stores", JSON.stringify(customStores));
  }, [customStores, hasLoadedStoredData]);

  const toggleStore = (storeId: string) => {
    if (cardInfo[storeId]) {
      setSelectedStores(prev =>
        prev.includes(storeId)
          ? prev.filter(id => id !== storeId)
          : [...prev, storeId]
      );
      return;
    }

    const store = allStores.find(s => s.id === storeId);
    setCardModalId(storeId);
    setCardModalOpen(true);
    //setTempCardName(cardInfo[storeId]?.name || store?.name || "");
    //setTempCardId(cardInfo[storeId]?.id || "");
    //setTempCardNumber(cardInfo[storeId]?.cardNumber || "");
  };

  const handleAddCard = () => {
    setCardModalId("new-card");
    setCardModalOpen(true);
    setTempCardName("");
    setTempCardId("");
    setTempCardNumber("");
  };

  const handleCardModalConfirm = () => {
    const cardName = tempCardName.trim();

    if (!cardName || !tempCardId.trim() || !tempCardNumber.trim()) {
      alert("Please fill in Card Name, ID, and Card Number");
      return;
    }

    if (cardModalId === "new-card") {
      // Generate a new store ID for custom card
      const newStoreId = `custom-${Date.now()}`;
      const newStore = { id: newStoreId, name: cardName, color: "#6366f1" };
      setCustomStores(prev => [...prev, newStore]);
      
      setSelectedStores(prev => [...prev, newStoreId]);
      setCardInfo(prev => ({
        ...prev,
        [newStoreId]: { name: cardName, id: tempCardId, cardNumber: tempCardNumber }
      }));
    } else if (cardModalId) {
      setSelectedStores(prev => 
        prev.includes(cardModalId) 
          ? prev 
          : [...prev, cardModalId]
      );
      setCardInfo(prev => ({
        ...prev,
        [cardModalId]: { name: cardName, id: tempCardId, cardNumber: tempCardNumber }
      }));
    }

    speakCardName(cardName);
    setCardModalOpen(false);
    setCardModalId(null);
    setTempCardName("");
    setTempCardId("");
    setTempCardNumber("");
  };

  const handleCredentialChange = (storeId: string, field: "username" | "password", value: string) => {
    setCredentials(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        [field]: value,
      }
    }));
  };

  const canProceedStep1 = selectedStores.length > 0;
  const canProceedStep2 = selectedStores.every(
    storeId => credentials[storeId]?.username && credentials[storeId]?.password
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
              step === s 
                ? "bg-primary text-primary-foreground" 
                : step > s 
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground"
            )}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={cn(
                "w-16 h-1 mx-2 rounded-full",
                step > s ? "bg-success" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Store Cards */}
      {step === 1 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Select Your Store Cards</h1>
            <p className="text-muted-foreground">Choose the store cards you want to link to Zonke</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {allStores.map((store) => {
              const isSelected = selectedStores.includes(store.id);
              const hasCardInfo = cardInfo[store.id];
              return (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="mx-auto mb-4 flex justify-center">
                    <StoreLogo store={store} />
                  </div>
                  <p className="font-semibold text-center">{store.name}</p>
                  {hasCardInfo && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Card: ••••{cardInfo[store.id].cardNumber.slice(-4)}</p>
                  )}
                </button>
              );
            })}
            <button
              onClick={handleAddCard}
              className="p-6 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-muted">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-center">Add Card</p>
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all",
              canProceedStep1
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Enter Credentials */}
      {step === 2 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Enter Credentials</h1>
            <p className="text-muted-foreground">Securely link your store card accounts</p>
          </div>

          <div className="space-y-6 mb-6">
            {selectedStores.map((storeId) => {
              const store = allStores.find(s => s.id === storeId)!;
              return (
                <div key={storeId} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <StoreLogo store={store} size="sm" />
                    <h3 className="font-semibold">{store.name}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Email / Username</label>
                      <input
                        type="text"
                        value={credentials[storeId]?.username || ""}
                        onChange={(e) => handleCredentialChange(storeId, "username", e.target.value)}
                        placeholder="Enter your email or username"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
                      <input
                        type="password"
                        value={credentials[storeId]?.password || ""}
                        onChange={(e) => handleCredentialChange(storeId, "password", e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button 
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-xs text-primary hover:underline mt-2">Forgot password?</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 mb-6">
            <Lock className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Bank-Grade Encryption</span>
            <span className="text-muted-foreground">·</span>
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">POPIA Compliant</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 rounded-lg font-medium border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all",
                canProceedStep2
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Link Accounts
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Your accounts are linked!</h1>
          <p className="text-muted-foreground mb-8">
            You&apos;ve successfully linked {selectedStores.length} store card{selectedStores.length > 1 ? "s" : ""} to Zonke
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">Enter your email and ID to reset your password</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">ID / Card Number</label>
                <input
                  type="text"
                  value={forgotPasswordId}
                  onChange={(e) => setForgotPasswordId(e.target.value)}
                  placeholder="Enter your ID or card number"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium border border-border hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle password reset
                  setForgotPasswordOpen(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordId("");
                }}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Info Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {cardModalId === "new-card" ? "Add New Card" : "Card Information"}
              </h2>
              <button
                onClick={() => {
                  setCardModalOpen(false);
                  setCardModalId(null);
                  setTempCardName("");
                  setTempCardId("");
                  setTempCardNumber("");
                }}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">Enter card name, ID, and card number</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Card Name</label>
                <input
                  type="text"
                  value={tempCardName}
                  onChange={(e) => setTempCardName(e.target.value)}
                  placeholder="e.g., TFG, Truworths, Ackermans"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">ID Number</label>
                <input
                  type="text"
                  value={tempCardId}
                  onChange={(e) => setTempCardId(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Card Number</label>
                <input
                  type="text"
                  value={tempCardNumber}
                  onChange={(e) => setTempCardNumber(e.target.value)}
                  placeholder="Enter your card number"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setCardModalOpen(false);
                  setCardModalId(null);
                  setTempCardName("");
                  setTempCardId("");
                  setTempCardNumber("");
                }}
                className="flex-1 py-2.5 px-4 rounded-lg font-medium border border-border hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCardModalConfirm}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
