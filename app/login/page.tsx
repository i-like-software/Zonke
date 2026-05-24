import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/zonke/Register";

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has("zonke_auth")) {
    redirect("/dashboard");
  }

  return <AuthPage />;
}
