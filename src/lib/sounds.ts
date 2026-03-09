import type { SoundEffect } from "@/types/audio";

const audioCache: Record<string, HTMLAudioElement> = {};

const SOUND_FILES: Record<SoundEffect, string> = {
  "piece-pickup": "/sounds/pickup.mp3",
  "piece-place": "/sounds/place.mp3",
  "wrong-move": "/sounds/bonk.mp3",
  "star-earned": "/sounds/sparkle.mp3",
  "chest-open": "/sounds/chest.mp3",
  confetti: "/sounds/confetti.mp3",
  "lesson-complete": "/sounds/complete.mp3",
  "button-tap": "/sounds/tap.mp3",
};

export function playSound(effect: SoundEffect, volume = 0.5) {
  if (typeof window === "undefined") return;
  if (!audioCache[effect]) {
    audioCache[effect] = new Audio(SOUND_FILES[effect]);
  }
  const audio = audioCache[effect];
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
