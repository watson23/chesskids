"use client";

import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";
import type { LocaleKey } from "@/types/locale";

type LessonPhase = "watch" | "try" | "celebrate" | "wrong";

interface NarrationAreaProps {
  narrationKey: LocaleKey | "";
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
  const { t } = useLocale();
  const text = narrationKey ? t(narrationKey) : "";
  const expression = getExpression(phase);

  return (
    <div className="flex items-end gap-3 w-full max-w-[360px] px-2" style={{ minHeight: 120 }}>
      <div className="flex-shrink-0">
        <Piku expression={expression} size={110} />
      </div>
      <SpeechBubble text={text} visible={!!text} />
    </div>
  );
}
