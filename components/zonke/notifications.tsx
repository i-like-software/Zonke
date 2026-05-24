"use client";

import { useState } from "react";
import { MessageSquare, Calendar, CreditCard, TrendingUp, Rocket, Check, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertPreference {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function Notifications() {
  const [notificationType, setNotificationType] = useState<"whatsapp" | "sms">("whatsapp");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+27 82 345 6789");
  const [testSent, setTestSent] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([
    { id: "payday", label: "Send me a summary on pay day", icon: Calendar, enabled: true },
    { id: "reminder", label: "Remind me 3 days before a payment is due", icon: MessageSquare, enabled: true },
    { id: "limit", label: "Alert me if I'm nearing my credit limit", icon: CreditCard, enabled: true },
    { id: "creditscore", label: "Update on my credit score after a month", icon: TrendingUp, enabled: true },
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

  const handleSendVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setVerificationCodeSent(true);
    setVerificationInput("");
  };

  const handleVerifyCode = () => {
    if (verificationInput === verificationCode) {
      setIsVerified(true);
      setVerificationCodeSent(false);
      setVerificationInput("");
      setTimeout(() => setIsVerified(false), 3000);
    }
  };

  const maskedPhone = phoneNumber.replace(/(\+27\s?\d{2})\s?(\d{3})\s?(\d{4})/, "$1 XXX XXXX");

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Notification Type Selection */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Notification Method</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setNotificationType("whatsapp")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              notificationType === "whatsapp"
                ? "bg-[#25D366] text-white"
                : "border border-border hover:bg-muted/50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={() => setNotificationType("sms")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              notificationType === "sms"
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted/50"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            SMS
          </button>
        </div>
      </div>
      {/* WhatsApp Opt-In Section */}
      {notificationType === "whatsapp" && (
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
            {isVerified && (
              <div className="bg-success/10 border border-success/20 text-success rounded-lg px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Number verified successfully!</span>
              </div>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">WhatsApp Number</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={verificationCodeSent}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>
                <button 
                  onClick={handleSendVerificationCode}
                  disabled={verificationCodeSent}
                  className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  Verify Number
                </button>
              </div>
            </div>
            {verificationCodeSent && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">We sent a verification code to your WhatsApp</p>
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-lg tracking-widest"
                />
                <button
                  onClick={handleVerifyCode}
                  className="w-full px-4 py-2.5 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#22c55e] transition-colors"
                >
                  Confirm Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* SMS Opt-In Section */}
      {notificationType === "sms" && (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-[var(--font-heading)]">SMS Alerts</h2>
            <p className="text-sm text-muted-foreground">Get payment reminders via SMS</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
          <span className="font-medium">Enable SMS Notifications</span>
          <Toggle enabled={smsEnabled} onToggle={() => setSmsEnabled(!smsEnabled)} />
        </div>

        {smsEnabled && (
          <div className="animate-slide-up space-y-4">
            {isVerified && (
              <div className="bg-success/10 border border-success/20 text-success rounded-lg px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Number verified successfully!</span>
              </div>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Phone Number</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={verificationCodeSent}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>
                <button 
                  onClick={handleSendVerificationCode}
                  disabled={verificationCodeSent}
                  className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  Verify Number
                </button>
              </div>
            </div>
            {verificationCodeSent && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">We sent a verification code to your SMS</p>
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-lg tracking-widest"
                />
                <button
                  onClick={handleVerifyCode}
                  className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirm Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}

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
            <span className="text-sm font-medium">Test {notificationType === "whatsapp" ? "WhatsApp" : "SMS"} notification sent to {maskedPhone}</span>
          </div>
        )}
        <button
          onClick={handleSendTest}
          disabled={notificationType === "whatsapp" ? !whatsappEnabled : !smsEnabled}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
            (notificationType === "whatsapp" ? whatsappEnabled : smsEnabled)
              ? notificationType === "whatsapp"
                ? "bg-[#25D366] text-white hover:bg-[#22c55e] hover:shadow-lg hover:shadow-[#25D366]/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Rocket className="w-5 h-5" />
          Send Test {notificationType === "whatsapp" ? "WhatsApp" : "SMS"} Notification
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
