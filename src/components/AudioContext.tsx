"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  src: string;
}

export const TRACKS: Track[] = [
  {
    id: "lofi",
    title: "Gece Lo-Fi & Odak",
    subtitle: "Yumuşak & Ritmik",
    src: "/music/gece-lofi.mp3",
  },
  {
    id: "piano",
    title: "Ay Dağları & Piyano",
    subtitle: "Dingin Doğa & Soft Piyano",
    src: "/music/ay-daglari-piyano.mp3",
  },
  {
    id: "sonata",
    title: "Ay Işığı Sonatı",
    subtitle: "Beethoven — Klasik Başyapıt",
    src: "/music/ay-isigi-sonati.mp3",
  },
];

interface AudioContextType {
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  changeVolume: (val: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Hafızadan ses ve son şarkı tercihini al
    const savedVol = localStorage.getItem("ayisigi_music_volume");
    if (savedVol !== null) {
      const v = parseFloat(savedVol);
      if (!isNaN(v)) setVolume(v);
    }
    const savedTrackId = localStorage.getItem("ayisigi_music_track");
    if (savedTrackId) {
      const t = TRACKS.find((tr) => tr.id === savedTrackId);
      if (t) setCurrentTrack(t);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.src);
      audioRef.current.loop = true; // Sonsuz tekrar döngüsü
    } else {
      audioRef.current.src = currentTrack.src;
      audioRef.current.loop = true;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem("ayisigi_music_volume", volume.toString());
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Audio play error:", e);
      });
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    localStorage.setItem("ayisigi_music_track", track.id);
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.loop = true;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Audio play error:", e);
      });
    }
  };

  const changeVolume = (val: number) => {
    setVolume(val);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        playTrack,
        togglePlay,
        changeVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
