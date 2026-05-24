"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Phone, CreditCard, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

interface PasswordRequirement {
  label: string;
  met: (pw: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", met: (pw) => pw.length >= 8 },
  { label: "Uppercase letter", met: (pw) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter", met: (pw) => /[a-z]/.test(pw) },
  { label: "Number", met: (pw) => /\d/.test(pw) },
  { label: "Special character (!@#$%^&*)", met: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

function validateSAId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(id[i]);
    if (i % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(id[12]);
}

function validateCellphone(phone: string): boolean {
  const cleaned = phone.replace(/\s|-/g, "");
  return /^(\+27|0)[6-8]\d{8}$/.test(cleaned);
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const met = PASSWORD_REQUIREMENTS.filter((r) => r.met(password)).length;
  if (met <= 1) return { score: met, label: "Very weak", color: "bg-destructive" };
  if (met === 2) return { score: met, label: "Weak", color: "bg-orange-500" };
  if (met === 3) return { score: met, label: "Fair", color: "bg-yellow-500" };
  if (met === 4) return { score: met, label: "Strong", color: "bg-green-500" };
  return { score: met, label: "Very strong", color: "bg-primary" };
}

export function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    idNumber: "",
    cellphone: "",
    username: "",
    password: "",
  });

  const password = mode === "login" ? loginForm.password : registerForm.password;
  const strength = getPasswordStrength(password);

  const validateLogin = () => {
    const errs: Record<string, string> = {};
    if (!loginForm.username.trim()) errs.username = "Username is required";
    if (!loginForm.password) errs.password = "Password is required";
    return errs;
  };

  const validateRegister = () => {
    const errs: Record<string, string> = {};
    if (!validateSAId(registerForm.idNumber))
      errs.idNumber = "Enter a valid 13-digit South African ID number";
    if (!validateCellphone(registerForm.cellphone))
      errs.cellphone = "Enter a valid SA cellphone number (e.g. 071 234 5678)";
    if (!registerForm.username.trim() || registerForm.username.length < 3)
      errs.username = "Username must be at least 3 characters";
    if (PASSWORD_REQUIREMENTS.some((r) => !r.met(registerForm.password)))
      errs.password = "Password does not meet all requirements";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = mode === "login" ? validateLogin() : validateRegister();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    // Simulate network call
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    document.cookie = 'zonke_auth=1; path=/; SameSite=Strict';
    router.push('/dashboard');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient blob */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-[var(--font-heading)] tracking-tight">
            Zonke
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage all your store cards in one place
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-border">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-medium transition-colors capitalize",
                  mode === m
                    ? "text-primary border-b-2 border-primary bg-card"
                    : "text-muted-foreground hover:text-foreground bg-secondary/30"
                )}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "register" && (
              <>
                {/* ID Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">ID Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={13}
                      placeholder="1234567890123"
                      value={registerForm.idNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setRegisterForm((f) => ({ ...f, idNumber: val }));
                        if (errors.idNumber) setErrors((prev) => ({ ...prev, idNumber: "" }));
                      }}
                      className={cn("pl-9", errors.idNumber && "border-destructive")}
                    />
                  </div>
                  {errors.idNumber && (
                    <p className="text-xs text-destructive">{errors.idNumber}</p>
                  )}
                </div>

                {/* Cellphone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Cellphone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="071 234 5678"
                      value={registerForm.cellphone}
                      onChange={(e) => {
                        setRegisterForm((f) => ({ ...f, cellphone: e.target.value }));
                        if (errors.cellphone) setErrors((prev) => ({ ...prev, cellphone: "" }));
                      }}
                      className={cn("pl-9", errors.cellphone && "border-destructive")}
                    />
                  </div>
                  {errors.cellphone && (
                    <p className="text-xs text-destructive">{errors.cellphone}</p>
                  )}
                </div>
              </>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  autoComplete={mode === "login" ? "username" : "new-username"}
                  placeholder="your_username"
                  value={mode === "login" ? loginForm.username : registerForm.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (mode === "login") {
                      setLoginForm((f) => ({ ...f, username: val }));
                    } else {
                      setRegisterForm((f) => ({ ...f, username: val }));
                    }
                    if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                  }}
                  className={cn("pl-9", errors.username && "border-destructive")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (mode === "login") {
                      setLoginForm((f) => ({ ...f, password: val }));
                    } else {
                      setRegisterForm((f) => ({ ...f, password: val }));
                    }
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={cn("pl-9 pr-10", errors.password && "border-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}

              {/* Password strength (register only) */}
              {mode === "register" && registerForm.password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {PASSWORD_REQUIREMENTS.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i < strength.score ? strength.color : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        strength.score <= 2 ? "text-destructive" : strength.score === 3 ? "text-yellow-500" : "text-primary"
                      )}
                    >
                      {strength.label}
                    </span>
                  </p>
                  <ul className="space-y-1">
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const met = req.met(registerForm.password);
                      return (
                        <li key={req.label} className="flex items-center gap-1.5 text-xs">
                          {met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={met ? "text-foreground" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
}
