import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "sun" | "moon";
}

function SunLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Opal hale */}
      <circle cx="24" cy="24" r="20" fill="#FFE8D0" opacity="0.45" />
      <circle cx="24" cy="24" r="17" fill="#FFF0E8" opacity="0.35" />
      {/* Güneş gövdesi */}
      <circle cx="24" cy="24" r="13" fill="#FFD54F" />
      <circle cx="21" cy="21" r="4.5" fill="#FFF9E6" opacity="0.65" />
      {/* Işınlar */}
      <g stroke="#F5A623" strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <line x1="24" y1="3" x2="24" y2="8" />
        <line x1="24" y1="40" x2="24" y2="45" />
        <line x1="3" y1="24" x2="8" y2="24" />
        <line x1="40" y1="24" x2="45" y2="24" />
        <line x1="9.1" y1="9.1" x2="12.7" y2="12.7" />
        <line x1="35.3" y1="35.3" x2="38.9" y2="38.9" />
        <line x1="9.1" y1="38.9" x2="12.7" y2="35.3" />
        <line x1="35.3" y1="12.7" x2="38.9" y2="9.1" />
      </g>
    </svg>
  );
}

function MoonLogo({ className }: { className?: string }) {
  const maskId = useId();
  return (
    <svg
      className={className}
      viewBox="0 6 28 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* viewBox hilalin gerçek sınırlarına kırpılmış — eskiden 48x48'lik
          kutunun sağında/üstünde/altında boş şeffaf alan vardı, bu da ikonu
          yazıdan gereksiz uzak gösteriyordu. */}
      {/* Gerçek bir maske ile kesilmiş hilal — arkadaki renge bağlı değil,
          bu yüzden fotoğraf gibi düz olmayan arka planların üzerinde de
          doğru görünür (eskisi --color-bg ile eşleşen bir daire çiziyordu,
          bu da fotoğraflı arka planlarda düz bir leke gibi duruyordu). */}
      <mask id={maskId}>
        <rect x="0" y="0" width="48" height="48" fill="white" />
        <circle cx="30" cy="24" r="14" fill="black" />
      </mask>
      <circle cx="18" cy="24" r="16" fill="#A855F7" mask={`url(#${maskId})`} />
    </svg>
  );
}

/** Aydınlık: sarı-opal güneş | Karanlık: mor hilal (uçlar sağa) */
export function Logo({ size = 40, className = "", variant }: LogoProps) {
  if (variant === "sun") {
    return (
      <span className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden="true">
        <SunLogo className="h-full w-full" />
      </span>
    );
  }
  if (variant === "moon") {
    return (
      <span className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden="true">
        <MoonLogo className="h-full w-full" />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <SunLogo className="theme-logo-sun absolute inset-0 h-full w-full" />
      <MoonLogo className="theme-logo-moon absolute inset-0 h-full w-full" />
    </span>
  );
}

interface SiteBrandProps {
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SiteBrand({ showName = true, size = "md", className = "" }: SiteBrandProps) {
  const logoSize = size === "sm" ? 26 : size === "lg" ? 52 : 40;
  const textClass =
    size === "sm"
      ? "text-base md:text-lg"
      : size === "lg"
        ? "text-3xl md:text-5xl"
        : "text-2xl";

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ay Işığı Kütüphanesi";

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <Logo size={logoSize} />
      {showName && (
        <span
          className={`font-serif font-medium leading-tight text-[var(--color-text)] ${textClass}`}
          style={{ fontFamily: "var(--font-literata), Literata, serif" }}
        >
          {siteName}
        </span>
      )}
    </div>
  );
}
