"use client";

import Pikku from "@/components/Pikku";
import SpeechBubble from "@/components/SpeechBubble";
import { useLocale } from "@/hooks/useLocale";

type MascotExpression = "happy" | "thinking" | "celebrating";

interface GameMascotBarProps {
  expression: MascotExpression;
  narrationKey: string;
}

/**
 * Compact horizontal mascot bar for game mode.
 * Shows the mascot pawn + speech bubble with game state narration.
 */
export default function GameMascotBar({ expression, narrationKey }: GameMascotBarProps) {
  const { t } = useLocale();
  const text = t(narrationKey);

  return (
    <div
      className="flex items-end gap-2 w-full max-w-[360px] px-2"
      style={{ minHeight: 80 }}
    >
      <div className="flex-shrink-0">
        <Pikku expression={expression} size={80} />
      </div>
      <SpeechBubble text={text} visible={!!text} />
    </div>
  );
}
