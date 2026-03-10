"use client";

import Pikku from "@/components/Pikku";
import SpeechBubble from "@/components/SpeechBubble";
import { useAudio } from "@/hooks/useAudio";

import en from "@/data/locale/en.json";
import fi from "@/data/locale/fi.json";

const locales: Record<string, Record<string, string>> = { en, fi };

type LessonPhase = "watch" | "try" | "celebrate" | "wrong";

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
    case "wrong":
      return "wrong" as const;
  }
}

export default function NarrationArea({ narrationKey, phase }: NarrationAreaProps) {
  const { language } = useAudio();
  const text = locales[language]?.[narrationKey] || locales.en[narrationKey] || "";
  const expression = getExpression(phase);

  return (
    <div className="flex items-end gap-3 w-full max-w-[360px] px-2" style={{ minHeight: 110 }}>
      <div className="flex-shrink-0">
        <Pikku expression={expression} size={96} />
      </div>
      <SpeechBubble text={text} visible={!!text} />
    </div>
  );
}
