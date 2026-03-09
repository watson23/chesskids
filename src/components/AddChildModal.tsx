"use client";

import { useState, useCallback } from "react";

const AVATARS = [
  "\u{1F981}", "\u{1F431}", "\u{1F436}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}",
  "\u{1F438}", "\u{1F984}", "\u{1F432}", "\u{1F419}", "\u{1F98B}", "\u{1F41D}",
  "\u{1F41E}", "\u{1F31F}", "\u{1F308}", "\u{1F388}",
];

interface AddChildModalProps {
  onAdd: (name: string, avatar: string) => void;
  onCancel: () => void;
}

export default function AddChildModal({ onAdd, onCancel }: AddChildModalProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleAdd = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed, selectedAvatar);
  }, [name, selectedAvatar, onAdd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-xl font-bold text-amber-900 text-center">
          New Player
        </h2>

        {/* Avatar picker */}
        <div className="grid grid-cols-8 gap-2 justify-items-center">
          {AVATARS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedAvatar(emoji)}
              className={`text-2xl p-1 rounded-xl transition-all ${
                selectedAvatar === emoji
                  ? "bg-amber-200 scale-110 ring-2 ring-amber-400"
                  : "hover:bg-amber-50 active:scale-95"
              }`}
              aria-label={`Select avatar ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Selected avatar preview */}
        <div className="flex justify-center">
          <span className="text-6xl">{selectedAvatar}</span>
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          maxLength={20}
          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl text-lg text-amber-900 placeholder-amber-300 focus:outline-none focus:border-amber-400 transition-colors"
          autoFocus
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={name.trim().length === 0}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold active:scale-95 transition-transform disabled:opacity-40 disabled:scale-100"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
