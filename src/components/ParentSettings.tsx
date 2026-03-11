"use client";

import { useState, useCallback } from "react";
import { SignOut, UserPlus } from "@phosphor-icons/react";
import Image from "next/image";
import { useAudio } from "@/hooks/useAudio";
import { useAuth } from "@/hooks/useAuth";
import AddChildModal from "@/components/AddChildModal";
import { addChild as addChildToFirestore } from "@/lib/firestore";

interface ParentSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function ParentSettings({ open, onClose }: ParentSettingsProps) {
  const { language, setLanguage, soundEnabled, setSoundEnabled } = useAudio();
  const {
    user,
    signOut,
    children: childProfiles,
    activeChild,
    setActiveChild,
    refreshChildren,
  } = useAuth();

  const [showAddChild, setShowAddChild] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    onClose();
  }, [signOut, onClose]);

  const handleAddChild = useCallback(
    async (name: string, avatar: string) => {
      if (!user) return;
      try {
        const child = await addChildToFirestore(user.uid, name, avatar);
        await refreshChildren();
        setActiveChild(child);
      } catch (err) {
        console.error("Failed to add child:", err);
      }
      setShowAddChild(false);
    },
    [user, refreshChildren, setActiveChild]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-amber-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Close settings"
          >
            <Image src="/icons/icon-close.webp" alt="Close" width={20} height={20} className="object-contain" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
          {/* Language */}
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Language
            </label>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 py-3 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                  language === "en"
                    ? "bg-amber-100 ring-2 ring-amber-400 text-amber-900"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
                aria-label="English"
              >
                <span className="mr-1.5">{"\ud83c\uddec\ud83c\udde7"}</span> EN
              </button>
              <button
                onClick={() => setLanguage("fi")}
                className={`flex-1 py-3 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                  language === "fi"
                    ? "bg-amber-100 ring-2 ring-amber-400 text-amber-900"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
                aria-label="Finnish"
              >
                <span className="mr-1.5">{"\ud83c\uddeb\ud83c\uddee"}</span> FI
              </button>
            </div>
          </div>

          {/* Sound */}
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Sound
            </label>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
                soundEnabled
                  ? "bg-amber-100 text-amber-900"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {soundEnabled ? (
                <Image src="/icons/icon-sound-on.webp" alt="Sound on" width={20} height={20} className="object-contain" />
              ) : (
                <Image src="/icons/icon-sound-off.webp" alt="Sound off" width={20} height={20} className="object-contain" />
              )}
              <span className="font-semibold">
                {soundEnabled ? "Sound On" : "Sound Off"}
              </span>
            </button>
          </div>

          {/* Children */}
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Players
            </label>
            <div className="flex flex-col gap-2 mt-2">
              {childProfiles.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
                    activeChild?.id === child.id
                      ? "bg-amber-100 ring-2 ring-amber-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-2xl">{child.avatar}</span>
                  <span className="font-semibold text-amber-900 truncate">
                    {child.name}
                  </span>
                  {activeChild?.id === child.id && (
                    <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-200 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setShowAddChild(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <UserPlus size={24} weight="bold" />
                <span className="font-semibold">Add player</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Sign out */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 active:scale-95 transition-all"
          >
            <SignOut size={22} weight="bold" />
            Sign out
          </button>
        </div>
      </div>

      {/* Add child modal */}
      {showAddChild && (
        <AddChildModal
          onAdd={handleAddChild}
          onCancel={() => setShowAddChild(false)}
        />
      )}
    </>
  );
}
