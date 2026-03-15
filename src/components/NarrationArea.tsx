"use client";

import Image from "next/image";
import Piku from "@/components/Piku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";
import type { LocaleKey } from "@/types/locale";

type LessonPhase = "watch" | "try" | "celebrate" | "wrong";

interface NarrationAreaProps {
  narrationKey: LocaleKey | "";
  phase: LessonPhase;
  onReplay?: () => void;
}

function getExpression(phase: LessonPhase) {
  switch (phase) {
    case "watch":
      return "standing-teaching" as const;
    case "try":
      return "thinking" as const;
    case "celebrate":
      return "celebrating" as const;
    case "wrong":
      return "wrong" as const;
  }
}

export default function NarrationArea({ narrationKey, phase, onReplay }: NarrationAreaProps) {
  const { t } = useLocale();
  const text = narrationKey ? t(narrationKey) : "";
  const expression = getExpression(phase);

  return (
    <div className="flex items-end gap-3 w-full max-w-[360px] px-2 overflow-hidden" style={{ height: 120 }}>
      <div className="flex-shrink-0">
        <Piku expression={expression} size={110} />
      </div>
      <SpeechBubble text={text} visible={!!text} />
      {onReplay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReplay();
          }}
          className="flex-shrink-0 p-2 active:scale-90 transition-transform"
          aria-label="Replay audio"
        >
          <Image
            src="/icons/icon-sound-on.webp"
            alt="Replay"
            width={36}
            height={36}
            className="object-contain drop-shadow-md"
          />
        </button>
      )}
    </div>
  );
}
