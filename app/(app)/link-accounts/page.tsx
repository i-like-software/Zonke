import { LinkAccounts } from "@/components/zonke/link-accounts";

export default function LinkAccountsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Link Accounts
        </h1>
      </header>
      <LinkAccounts />
    </>
  );
}
