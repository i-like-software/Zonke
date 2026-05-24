"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Trash2, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", met: (pw: string) => pw.length >= 8 },
  { label: "Uppercase letter", met: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter", met: (pw: string) => /[a-z]/.test(pw) },
  { label: "Number", met: (pw: string) => /\d/.test(pw) },
  { label: "Special character (!@#$%^&*)", met: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

function getPasswordStrength(password: string) {
  const met = PASSWORD_REQUIREMENTS.filter((r) => r.met(password)).length;
  if (met <= 1) return { score: met, label: "Very weak", color: "bg-destructive" };
  if (met === 2) return { score: met, label: "Weak", color: "bg-orange-500" };
  if (met === 3) return { score: met, label: "Fair", color: "bg-yellow-500" };
  if (met === 4) return { score: met, label: "Strong", color: "bg-green-500" };
  return { score: met, label: "Very strong", color: "bg-primary" };
}

export function AccountSettings() {
  const router = useRouter();

  const [username, setUsername] = useState("Thabo");
  const [usernameInput, setUsernameInput] = useState("Thabo");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const newPasswordStrength = getPasswordStrength(newPassword);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || usernameInput.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    setUsernameError("");
    setUsernameLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setUsernameLoading(false);
    setUsername(usernameInput);
    setUsernameSuccess(true);
    setTimeout(() => setUsernameSuccess(false), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Current password is required";
    if (PASSWORD_REQUIREMENTS.some((r) => !r.met(newPassword)))
      errs.newPassword = "Password does not meet all requirements";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});
    setPasswordLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setPasswordLoading(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    document.cookie = "zonke_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Username */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-[var(--font-heading)]">Username</h2>
        </div>
        <form onSubmit={handleUsernameUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current username</label>
            <p className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">{username}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New username</label>
            <Input
              type="text"
              placeholder="Enter new username"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setUsernameError("");
                setUsernameSuccess(false);
              }}
              className={cn(usernameError && "border-destructive")}
            />
            {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={usernameLoading || usernameInput === username}>
              {usernameLoading ? "Saving..." : "Update Username"}
            </Button>
            {usernameSuccess && (
              <span className="text-sm text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-[var(--font-heading)]">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current password</label>
            <div className="relative">
              <Input
                type={showCurrentPw ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordErrors((p) => ({ ...p, currentPassword: "" }));
                  setPasswordSuccess(false);
                }}
                className={cn("pr-10", passwordErrors.currentPassword && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New password</label>
            <div className="relative">
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors((p) => ({ ...p, newPassword: "" }));
                  setPasswordSuccess(false);
                }}
                className={cn("pr-10", passwordErrors.newPassword && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
            )}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {PASSWORD_REQUIREMENTS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        i < newPasswordStrength.score ? newPasswordStrength.color : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <ul className="space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req) => {
                    const met = req.met(newPassword);
                    return (
                      <li key={req.label} className="flex items-center gap-1.5 text-xs">
                        {met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className={met ? "text-foreground" : "text-muted-foreground"}>{req.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirm new password</label>
            <div className="relative">
              <Input
                type={showConfirmPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordErrors((p) => ({ ...p, confirmPassword: "" }));
                  setPasswordSuccess(false);
                }}
                className={cn("pr-10", passwordErrors.confirmPassword && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
            {passwordSuccess && (
              <span className="text-sm text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Password updated
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Delete Account */}
      <div className="bg-card rounded-xl border border-destructive/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-semibold font-[var(--font-heading)] text-destructive">Delete Account</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Permanently delete your Zonke account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">
                Type <span className="font-bold">DELETE</span> to confirm. This cannot be undone.
              </p>
            </div>
            <Input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="border-destructive/50 focus-visible:ring-destructive"
            />
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
