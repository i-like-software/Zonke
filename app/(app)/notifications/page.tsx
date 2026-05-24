import { Notifications } from "@/components/zonke/notifications";

export default function NotificationsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Notifications
        </h1>
      </header>
      <Notifications />
    </>
  );
}
