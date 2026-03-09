export type SoundEffect =
  | "piece-pickup"
  | "piece-place"
  | "wrong-move"
  | "star-earned"
  | "chest-open"
  | "confetti"
  | "lesson-complete"
  | "button-tap";

export interface TTSOptions {
  lang: "fi" | "en";
  rate?: number;
  pitch?: number;
}
