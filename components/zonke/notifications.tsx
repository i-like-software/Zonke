"use client";

import { useState } from "react";
import { MessageSquare, Calendar, CreditCard, TrendingUp, Rocket, Check, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertPreference {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function Notifications() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("+27 82 345 6789");
  const [testSent, setTestSent] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([
    { id: "payday", label: "Send me a summary on pay day", icon: Calendar, enabled: true },
    { id: "reminder", label: "Remind me 3 days before a payment is due", icon: MessageSquare, enabled: true },
    { id: "limit", label: "Alert me if I'm nearing my credit limit", icon: CreditCard, enabled: true },
    { id: "weekly", label: "Weekly spending digest", icon: TrendingUp, enabled: false },
  ]);

  const toggleAlert = (id: string) => {
    setAlertPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const maskedPhone = phoneNumber.replace(/(\+27\s?\d{2})\s?(\d{3})\s?(\d{4})/, "$1 XXX XXXX");

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* WhatsApp Opt-In Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-[var(--font-heading)]">WhatsApp Alerts</h2>
            <p className="text-sm text-muted-foreground">Get payment reminders on WhatsApp</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
          <span className="font-medium">Enable WhatsApp Notifications</span>
          <Toggle enabled={whatsappEnabled} onToggle={() => setWhatsappEnabled(!whatsappEnabled)} />
        </div>

        {whatsappEnabled && (
          <div className="animate-slide-up space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">WhatsApp Number</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <button className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                  Verify Number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Preferences */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold font-[var(--font-heading)] mb-4">Alert Preferences</h3>
        <div className="space-y-2">
          {alertPreferences.map((pref) => {
            const Icon = pref.icon;
            return (
              <div 
                key={pref.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{pref.label}</span>
                </div>
                <Toggle enabled={pref.enabled} onToggle={() => toggleAlert(pref.id)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Notification Button */}
      <div className="relative">
        {testSent && (
          <div className="absolute -top-12 left-0 right-0 bg-success/10 border border-success/20 text-success rounded-lg px-4 py-3 flex items-center gap-2 animate-slide-up">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Test notification sent to {maskedPhone}</span>
          </div>
        )}
        <button
          onClick={handleSendTest}
          disabled={!whatsappEnabled}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
            whatsappEnabled
              ? "bg-[#25D366] text-white hover:bg-[#22c55e] hover:shadow-lg hover:shadow-[#25D366]/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Rocket className="w-5 h-5" />
          Send Test WhatsApp Notification
        </button>
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        enabled ? "bg-primary" : "bg-muted"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
          enabled ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  );
}
