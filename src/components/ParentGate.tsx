"use client";

import { useState, useCallback, useMemo } from "react";
import Piku from "@/components/Piku";
import { useAudio } from "@/hooks/useAudio";

interface ParentGateProps {
  open: boolean;
  onPass: () => void;
  onCancel: () => void;
}

function generateProblem(): { a: number; b: number } {
  const a = Math.floor(Math.random() * 41) + 10; // 10-50
  const b = Math.floor(Math.random() * 41) + 10; // 10-50
  return { a, b };
}

export default function ParentGate({ open, onPass, onCancel }: ParentGateProps) {
  const { t } = useAudio();
  const [problem, setProblem] = useState(generateProblem);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);

  const correctAnswer = useMemo(() => problem.a + problem.b, [problem]);

  const handleSubmit = useCallback(() => {
    if (parseInt(answer, 10) === correctAnswer) {
      setAnswer("");
      setWrong(false);
      onPass();
    } else {
      setWrong(true);
      setAnswer("");
      setProblem(generateProblem());
    }
  }, [answer, correctAnswer, onPass]);

  const handleCancel = useCallback(() => {
    setAnswer("");
    setWrong(false);
    setProblem(generateProblem());
    onCancel();
  }, [onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center gap-4 animate-fade-in-up">
        <Piku expression="teaching" size={90} />

        <h3 className="text-xl font-extrabold text-amber-900 text-center">
          {t("parent_gate_title")}
        </h3>

        <p className="text-sm text-gray-600 text-center">
          {t("parent_gate_instruction")}
        </p>

        <p className="text-3xl font-extrabold text-amber-800">
          {problem.a} + {problem.b} = ?
        </p>

        {wrong && (
          <p className="text-sm text-red-500 font-semibold">
            {t("parent_gate_wrong")}
          </p>
        )}

        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={t("parent_gate_placeholder")}
          className="w-32 text-center text-2xl font-bold py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none transition-colors"
          autoFocus
        />

        <div className="flex gap-3 w-full">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 active:scale-95 transition-all"
          >
            {t("parent_gate_cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!answer}
            className="flex-1 px-4 py-3 rounded-xl bg-amber-400 text-white font-bold hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-40"
          >
            {t("parent_gate_submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
