import type { TTSOptions } from "@/types/audio";

let voicesLoaded = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  if (voicesLoaded) {
    return Promise.resolve(window.speechSynthesis.getVoices());
  }
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    // Chrome loads voices asynchronously
    const onVoicesChanged = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    // Fallback timeout in case event never fires
    setTimeout(() => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });
  return voicesPromise;
}

/**
 * Score voices by quality. Higher = better.
 * Prefers Google, Apple premium, and "neural"/"enhanced" voices.
 * Penalizes robotic engines like espeak and mbrola.
 */
function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  langPrefix: string
): SpeechSynthesisVoice | null {
  const matching = voices.filter((v) => v.lang.startsWith(langPrefix));
  if (matching.length === 0) return null;
  if (matching.length === 1) return matching[0];

  const scored = matching.map((v) => {
    let score = 0;
    const name = v.name.toLowerCase();

    // Penalize known-bad engines
    if (name.includes("espeak")) score -= 100;
    if (name.includes("mbrola")) score -= 80;

    // Prefer Google voices (high quality on Chrome)
    if (name.includes("google")) score += 50;

    // Prefer Apple premium voices (Safari / macOS)
    const appleHQ = ["samantha", "karen", "daniel", "satu", "moira", "tessa", "fiona"];
    if (appleHQ.some((n) => name.includes(n))) score += 40;

    // Prefer voices labeled as premium/enhanced/natural/neural
    if (/premium|enhanced|natural|neural|wavenet/i.test(name)) score += 30;

    // Prefer non-default / non-generic
    if (v.localService === false) score += 10; // network voices are usually higher quality

    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].voice;
}

/** Pre-load voices so the first speak() call doesn't hit the async gap. */
export function preloadVoices(): void {
  loadVoices();
}

export async function speak(text: string, options: TTSOptions): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Chrome/WebKit bug: calling cancel() immediately before speak() can silently
  // cancel the new utterance too. Add a brief delay when cancelling active speech.
  const wasSpeaking = window.speechSynthesis.speaking;
  window.speechSynthesis.cancel();
  if (wasSpeaking) {
    await new Promise((r) => setTimeout(r, 100));
  }

  const voices = await loadVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang === "fi" ? "fi-FI" : "en-US";
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1.1;

  const langPrefix = options.lang === "fi" ? "fi" : "en";
  let voice = pickBestVoice(voices, langPrefix);

  // If no voice found for this language (e.g. Chrome iPad lacks Finnish),
  // fall back to any available voice — spoken with an accent is better than silence.
  if (!voice && voices.length > 0) {
    voice = pickBestVoice(voices, "en") ?? voices[0];
  }
  if (voice) utterance.voice = voice;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn("[TTS] Speech error:", e.error, "lang:", utterance.lang, "voice:", utterance.voice?.name);
      resolve();
    };
    window.speechSynthesis.speak(utterance);
    // Chrome bug: speech can get stuck. Resume after short delay.
    setTimeout(() => {
      window.speechSynthesis.resume();
    }, 100);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
