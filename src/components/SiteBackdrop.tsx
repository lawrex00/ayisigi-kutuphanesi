"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

// Deterministic star field scattered across the whole sky, each twinkling
// on an independent, irregular rhythm (randomized duration + phase offset
// so they never feel synchronized).
const TOTAL_STARS = 90;
const STARS = Array.from({ length: TOTAL_STARS }, (_, i) => {
  const x = Number(((i * 53.17 + (i % 5) * 11.3) % 100).toFixed(2));
  const y = Number(((i * 31.71 + (i % 9) * 7.9) % 100).toFixed(2));
  const size = Number((0.8 + ((i * 13) % 17) / 10).toFixed(2));
  const duration = Number((1.6 + ((i * 23) % 61) / 10).toFixed(2));
  const delay = Number((-(((i * 19) % 97) / 10)).toFixed(2));
  return { id: i, x, y, size, duration, delay };
});

/**
 * Site-wide, fixed (viewport-sized) background scene. Covers every page the
 * app renders inside <body>, not just the hero — scrolling moves the real
 * content over it, the scene itself stays put. Dark mode: starry night sky
 * photo. Light mode: sunrise valley photo with a sun that rises as the page
 * scrolls. Sized to the viewport (not page height) so "cover" always frames
 * the photo correctly regardless of how tall the page content is.
 */
export function SiteBackdrop() {
  const { prefs, mounted } = useTheme();
  const [sunLift, setSunLift] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      targetRef.current = window.scrollY;
    };

    const loop = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.07;
      setSunLift(currentRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!mounted) return null;

  const sunRise = Math.min(sunLift * 0.5, 320);

  return (
    <div id="site-backdrop" aria-hidden="true">
      {prefs.theme === "dark" && (
        <div className="site-stars absolute inset-0">
          {STARS.map((star) => (
            <div
              key={star.id}
              className="sky-star"
              style={
                {
                  top: `${star.y}%`,
                  left: `${star.x}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  "--star-twinkle-dur": `${star.duration}s`,
                  "--star-twinkle-delay": `${star.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {prefs.theme === "light" && (
        <>
          <div className="dawn-mist-drift absolute inset-0" />
          <div
            className="dawn-sun-wrap absolute inset-0"
            style={{ transform: `translateY(${-sunRise}px)` }}
          >
            <div className="dawn-sun-glow absolute left-[52%] -translate-x-1/2" />
            <div className="dawn-sun absolute left-[52%] -translate-x-1/2" />
          </div>
        </>
      )}
    </div>
  );
}
