"use client";

import type { ChildProfile } from "@/types/user";

interface ChildSelectorProps {
  profiles: ChildProfile[];
  onSelect: (child: ChildProfile) => void;
  onAddChild: () => void;
}

export default function ChildSelector({ profiles, onSelect, onAddChild }: ChildSelectorProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-6" style={{ background: "var(--ck-bg)" }}>
      <h1 className="text-2xl font-bold" style={{ color: "var(--ck-text)" }}>Who is playing?</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className="card-pillow flex flex-col items-center gap-2 p-4 hover:shadow-lg active:scale-95 transition-all min-w-[100px]"
          >
            <span className="text-5xl">{child.avatar}</span>
            <span className="text-sm font-semibold truncate max-w-[90px]" style={{ color: "var(--ck-text)" }}>
              {child.name}
            </span>
          </button>
        ))}

        {/* Add child button */}
        <button
          onClick={onAddChild}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] border-2 border-dashed active:scale-95 transition-all min-w-[100px] min-h-[110px]"
          style={{ borderColor: "var(--ck-purple)", background: "rgba(177, 151, 252, 0.08)" }}
        >
          <span className="text-4xl" style={{ color: "var(--ck-purple)" }}>+</span>
          <span className="text-xs font-medium" style={{ color: "var(--ck-purple-dark)" }}>Add</span>
        </button>
      </div>
    </div>
  );
}
