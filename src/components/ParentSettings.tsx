"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/hooks/useAudio";
import { useAuth } from "@/hooks/useAuth";
import AddChildModal from "@/components/AddChildModal";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import { addChild as addChildToFirestore } from "@/lib/firestore";

interface ParentSettingsProps {
  open: boolean;
  onClose: () => void;
  onChildAdded?: () => void;
}

export default function ParentSettings({ open, onClose, onChildAdded }: ParentSettingsProps) {
  const { language, setLanguage, soundEnabled, setSoundEnabled, t } = useAudio();
  const {
    user,
    signOut,
    deleteAccount,
    children: childProfiles,
    activeChild,
    setActiveChild,
    refreshChildren,
  } = useAuth();

  const [showAddChild, setShowAddChild] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        onChildAdded?.();
        onClose();
      } catch (err) {
        console.error("Failed to add child:", err);
      }
      setShowAddChild(false);
    },
    [user, refreshChildren, setActiveChild, onChildAdded, onClose]
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
          <h2 className="text-lg font-bold text-amber-900">{t("settings_title")}</h2>
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
              {t("settings_language")}
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
              {t("settings_sound")}
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
                {soundEnabled ? t("settings_sound_on") : t("settings_sound_off")}
              </span>
            </button>
          </div>

          {/* Children */}
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {t("settings_players")}
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
                      {t("settings_active")}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setShowAddChild(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Image src="/icons/icon-add-player.webp" alt="" width={24} height={24} className="object-contain" style={{ width: 24, height: "auto" }} />
                <span className="font-semibold">{t("settings_add_player")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
          <Link
            href="/privacy"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-600 font-semibold hover:bg-gray-100 active:scale-95 transition-all text-sm"
          >
            {t("settings_privacy_policy")}
          </Link>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 active:scale-95 transition-all text-sm"
          >
            {t("settings_delete_data")}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 active:scale-95 transition-all"
          >
            <Image src="/icons/icon-sign-out.webp" alt="" width={22} height={22} className="object-contain" style={{ width: 22, height: "auto" }} />
            {t("settings_sign_out")}
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

      {/* Delete account dialog */}
      {showDeleteDialog && (
        <DeleteAccountDialog
          onConfirm={async () => {
            await deleteAccount();
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
}
