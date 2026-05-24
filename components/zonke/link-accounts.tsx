"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Store = {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
};

const StoreLogo = ({ store, size = "lg" }: { store: Store; size?: "sm" | "lg" }) => {
  const sizeClass = size === "lg" ? "w-16 h-16" : "w-10 h-10";

  if (store.logoUrl) {
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-xl bg-white p-2 shadow-sm`}>
        <img src={store.logoUrl} alt={`${store.name} logo`} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center font-bold text-white bg-indigo-500 rounded-xl`}>
      {store.name.charAt(0)}
    </div>
  );
};

export function LinkAccounts() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [apiStores, setApiStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch("/api/stores").then((r) => r.json()).then(setApiStores);
  }, []);

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev =>
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  const handleContinue = async () => {
    await fetch("/api/user/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeIds: selectedStores }),
    });
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2].map((s) => (
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
            {s < 2 && (
              <div className={cn("w-16 h-1 mx-2 rounded-full", step > s ? "bg-success" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Stores */}
      {step === 1 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">Select Your Store Cards</h1>
            <p className="text-muted-foreground">Choose the store cards you want to link to Zonke</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {apiStores.map((store) => {
              const isSelected = selectedStores.includes(store.id);
              return (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
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
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedStores.length === 0}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all",
              selectedStores.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Success */}
      {step === 2 && (
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
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
