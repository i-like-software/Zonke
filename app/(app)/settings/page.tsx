import { AccountSettings } from "@/components/zonke/settings";

export default function SettingsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your username, password, and account.</p>
      </header>
      <AccountSettings />
    </>
  );
}
