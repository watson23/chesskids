"use client";

import { useState, useEffect } from "react";
import Confetti from "@/components/Confetti";
import type { ChestDefinition, Reward } from "@/types/lesson";

interface ChestOpenModalProps {
  chest: ChestDefinition;
  onClose: () => void;
}

function rewardLabel(reward: Reward): string {
  if (reward.type === "board-theme" && reward.themeId) {
    const name = reward.themeId.charAt(0).toUpperCase() + reward.themeId.slice(1);
    return `${name} Board Theme`;
  }
  if (reward.type === "piece-color" && reward.pieceColorId) {
    const name =
      reward.pieceColorId.charAt(0).toUpperCase() + reward.pieceColorId.slice(1);
    return `${name} Piece Color`;
  }
  return "Mystery Reward";
}

export default function ChestOpenModal({ chest, onClose }: ChestOpenModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <Confetti active={showConfetti} />

      {/* Modal card */}
      <div className="relative z-50 bg-white rounded-3xl shadow-2xl p-8 mx-6 max-w-sm w-full text-center animate-slide-in">
        <span className="text-6xl block mb-4">{"\ud83c\udf81"}</span>

        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Treasure Unlocked!
        </h2>

        <p className="text-gray-600 mb-4">You unlocked:</p>

        <div className="space-y-2 mb-6">
          {chest.rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-amber-50 rounded-xl px-4 py-3 text-lg font-semibold text-amber-800"
            >
              {reward.type === "board-theme" ? "\ud83c\udfa8" : "\u265f\ufe0f"}{" "}
              {rewardLabel(reward)}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
