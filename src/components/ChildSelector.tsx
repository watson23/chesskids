"use client";

import type { ChildProfile } from "@/types/user";

interface ChildSelectorProps {
  profiles: ChildProfile[];
  onSelect: (child: ChildProfile) => void;
  onAddChild: () => void;
}

export default function ChildSelector({ profiles, onSelect, onAddChild }: ChildSelectorProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-amber-50 gap-8 px-6">
      <h1 className="text-2xl font-bold text-amber-900">Who is playing?</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg active:scale-95 transition-all min-w-[100px]"
          >
            <span className="text-5xl">{child.avatar}</span>
            <span className="text-sm font-semibold text-amber-800 truncate max-w-[90px]">
              {child.name}
            </span>
          </button>
        ))}

        {/* Add child button */}
        <button
          onClick={onAddChild}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all min-w-[100px] min-h-[110px]"
        >
          <span className="text-4xl text-amber-400">+</span>
          <span className="text-xs font-medium text-amber-500">Add</span>
        </button>
      </div>
    </div>
  );
}
