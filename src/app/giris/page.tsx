import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/components/LoginForm";
import { isGoogleAuthConfigured } from "@/lib/api-config";

export default function LoginPage() {
  const googleConfigured = isGoogleAuthConfigured();
  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />
      <Suspense>
        <LoginForm googleConfigured={googleConfigured} />
      </Suspense>
    </div>
  );
}
