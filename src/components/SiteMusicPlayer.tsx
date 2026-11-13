"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAudio, TRACKS } from "@/components/AudioContext";

export function SiteMusicPlayer() {
  const { currentTrack, isPlaying, volume, playTrack, togglePlay, changeVolume } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Sağ Üst Header Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all hover:scale-105 active:scale-95 shadow-sm"
        style={{
          borderColor: isPlaying ? "var(--color-accent)" : "var(--color-border)",
          backgroundColor: isPlaying ? "rgba(168, 85, 247, 0.12)" : "var(--color-surface)",
          color: isPlaying ? "var(--color-accent)" : "var(--color-text)",
        }}
        title="Fon Müziği Seçimi ve Ses Ayarı"
        aria-label="Müzik Oynatıcı"
      >
        {/* Hareketli Müzik İkonu / Equalizer Çubukları */}
        {isPlaying ? (
          <span className="flex items-end gap-[2.5px] h-4 w-4 justify-center" aria-hidden="true">
            <span className="w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-3" style={{ animationDuration: "0.8s" }}></span>
            <span className="w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-4" style={{ animationDuration: "1.1s", animationDelay: "0.2s" }}></span>
            <span className="w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-2" style={{ animationDuration: "0.7s", animationDelay: "0.4s" }}></span>
          </span>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
        <span className="font-medium text-xs sm:text-sm tracking-wide">
          {isPlaying ? "Müzik Açık" : "Müzik"}
        </span>
      </button>

      {/* Tıklandığında Hemen Butonun Altında Çıkan Şık Açılır Pencere */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl border transition-all animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35), 0 0 25px rgba(168,85,247,0.15)",
          }}
        >
          {/* Üst Başlık & Oynat/Durdur Butonu */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌙</span>
              <div>
                <h4 className="font-serif text-sm font-semibold leading-tight text-[var(--color-text)]">
                  Okuma Ambiyansı
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Sonsuz döngüde kesintisiz çalar
                </p>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90 hover:opacity-90 shadow-md"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-btn-text, #ffffff)",
              }}
              title={isPlaying ? "Durdur" : "Başlat"}
            >
              {isPlaying ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Şarkı Listesi */}
          <div className="space-y-1.5 mb-3.5">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] px-1">
              Melodi Seç
            </label>
            {TRACKS.map((t) => {
              const active = t.id === currentTrack.id;
              return (
                <button
                  key={t.id}
                  onClick={() => playTrack(t)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    active
                      ? "border font-medium shadow-sm"
                      : "hover:bg-[var(--color-border)]/40 text-[var(--color-text)] opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: active ? "rgba(168, 85, 247, 0.16)" : "transparent",
                    borderColor: active ? "var(--color-accent)" : "transparent",
                    color: active ? "var(--color-accent)" : "var(--color-text)",
                  }}
                >
                  <div className="truncate pr-2">
                    <div className="font-medium text-[13px]">{t.title}</div>
                    <div className="text-[10px] opacity-75">{t.subtitle}</div>
                  </div>
                  {active && isPlaying && (
                    <span className="shrink-0 flex items-center gap-1 text-[var(--color-accent)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-ping"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ses Seviyesi Ayarı (Volume Slider) */}
          <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center gap-2.5 text-xs text-[var(--color-text-muted)]">
            <button
              onClick={() => changeVolume(volume === 0 ? 0.5 : 0)}
              className="hover:text-[var(--color-text)] transition-colors p-1"
              title={volume === 0 ? "Sesi Aç" : "Sesi Kapat"}
            >
              {volume === 0 ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-accent)] cursor-pointer h-1.5 rounded-lg bg-[var(--color-border)]"
              aria-label="Ses Seviyesi"
            />
            <span className="w-8 text-right font-mono text-[11px] tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
