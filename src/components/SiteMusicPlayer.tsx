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
      {/* Sağ Üst Header Butonu - Apple Glassmorphism */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm backdrop-blur-md"
        style={{
          borderColor: isPlaying ? "var(--color-accent)" : "var(--color-border)",
          backgroundColor: isPlaying ? "rgba(168, 85, 247, 0.16)" : "var(--glass-bg)",
          color: isPlaying ? "var(--color-accent)" : "var(--color-text)",
          boxShadow: isPlaying ? "0 0 16px rgba(168, 85, 247, 0.25)" : "none",
        }}
        title="Fon Müziği Seçimi ve Ses Ayarı"
        aria-label="Müzik Oynatıcı"
      >
        {/* Hareketli Müzik İkonu / Equalizer Çubukları */}
        {isPlaying ? (
          <span className="flex items-end gap-[2px] h-3.5 w-3.5 sm:h-4 sm:w-4 justify-center" aria-hidden="true">
            <span className="w-0.5 sm:w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-2.5 sm:h-3" style={{ animationDuration: "0.8s" }}></span>
            <span className="w-0.5 sm:w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-3.5 sm:h-4" style={{ animationDuration: "1.1s", animationDelay: "0.2s" }}></span>
            <span className="w-0.5 sm:w-1 bg-[var(--color-accent)] rounded-full animate-bounce h-2 sm:h-2" style={{ animationDuration: "0.7s", animationDelay: "0.4s" }}></span>
          </span>
        ) : (
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
        <span className="tracking-wide">
          {isPlaying ? "Çalıyor" : "Müzik"}
        </span>
      </button>

      {/* Tıklandığında Çıkan Apple Frosted Glass Açılır Menü */}
      {isOpen && (
        <div
          className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 rounded-3xl p-5 shadow-2xl z-50 backdrop-blur-2xl border transition-all animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4), 0 0 30px rgba(168,85,247,0.18)",
          }}
        >
          {/* Üst Başlık & Oynat/Durdur Butonu */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌙</span>
              <div>
                <h4 className="font-serif text-sm font-bold leading-tight text-[var(--color-text)]">
                  Okuma Ambiyansı
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Kesintisiz fon müziği
                </p>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              title={isPlaying ? "Durdur" : "Oynat"}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Parça Listesi */}
          <div className="space-y-2 mb-4">
            {TRACKS.map((track) => {
              const active = currentTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left text-xs transition-all duration-200 border ${
                    active
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 font-semibold text-[var(--color-accent)] shadow-sm"
                      : "border-transparent hover:border-[var(--color-border)] hover:bg-white/5 text-[var(--color-text)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{track.icon}</span>
                    <span className="truncate">{track.title}</span>
                  </div>
                  {active && isPlaying && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white shrink-0">
                      Çalıyor
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ses Seviyesi Slider */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
              <span>Ses Düzeyi</span>
              <span>%{Math.round(volume * 100)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-accent)] cursor-pointer h-1.5 rounded-lg bg-[var(--color-border)] appearance-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
