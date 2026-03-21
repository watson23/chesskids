"use client";

import { useState } from "react";
import Piku from "@/components/Piku";
import { useAudio } from "@/hooks/useAudio";

interface DeleteAccountDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteAccountDialog({ onConfirm, onCancel }: DeleteAccountDialogProps) {
  const { t } = useAudio();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(false);
    try {
      await onConfirm();
    } catch {
      setError(true);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={deleting ? undefined : onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center gap-4 animate-fade-in-up">
        <Piku expression="sad" size={100} />

        <h3 className="text-xl font-extrabold text-amber-900 text-center">
          {t("delete_title")}
        </h3>

        <p className="text-sm text-gray-600 text-center leading-relaxed">
          {t("delete_warning")}
        </p>

        {error && (
          <p className="text-sm text-red-600 text-center font-semibold">
            {t("delete_error")}
          </p>
        )}

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="w-full px-4 py-3 rounded-xl bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {t("delete_cancel")}
          </button>

          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {deleting ? "..." : t("delete_confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
