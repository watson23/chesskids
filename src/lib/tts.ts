import type { TTSOptions } from "@/types/audio";

export function speak(text: string, options: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang === "fi" ? "fi-FI" : "en-US";
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === "canceled") resolve();
      else reject(e);
    };
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = options.lang === "fi" ? "fi" : "en";
    const voice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
