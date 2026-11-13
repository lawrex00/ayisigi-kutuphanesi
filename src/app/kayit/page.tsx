import { SiteHeader } from "@/components/SiteHeader";
import { RegisterForm } from "@/components/RegisterForm";
import { isGoogleAuthConfigured } from "@/lib/api-config";

export default function RegisterPage() {
  return (
    <div className="site-transparent min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />
      <RegisterForm googleConfigured={isGoogleAuthConfigured()} />
    </div>
  );
}
