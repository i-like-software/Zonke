import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/zonke/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.has("zonke_auth")) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
