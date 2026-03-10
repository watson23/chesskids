"use client";

import MascotPawn from "@/components/MascotPawn";
import SpeechBubble from "@/components/SpeechBubble";
import { useAudio } from "@/hooks/useAudio";

import en from "@/data/locale/en.json";
import fi from "@/data/locale/fi.json";

const locales: Record<string, Record<string, string>> = { en, fi };

type LessonPhase = "watch" | "try" | "celebrate";

interface NarrationAreaProps {
  narrationKey: string;
  phase: LessonPhase;
}

function getExpression(phase: LessonPhase) {
  switch (phase) {
    case "watch":
      return "happy" as const;
    case "try":
      return "thinking" as const;
    case "celebrate":
      return "celebrating" as const;
  }
}

export default function NarrationArea({ narrationKey, phase }: NarrationAreaProps) {
  const { language } = useAudio();
  const text = locales[language]?.[narrationKey] || locales.en[narrationKey] || "";
  const expression = getExpression(phase);

  return (
    <div className="flex items-end gap-3 w-full max-w-[360px] px-2" style={{ minHeight: 100 }}>
      <div className="flex-shrink-0">
        <MascotPawn expression={expression} size={72} />
      </div>
      <SpeechBubble text={text} visible={!!text} />
    </div>
  );
}
