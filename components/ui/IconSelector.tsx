"use client";
import React from "react";
import {
  Brain,
  Heart,
  Leaf,
  Stethoscope,
  BarChart3,
  ClipboardList,
  Scale,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
type IconOption = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

const ICONS: IconOption[] = [
  { key: "Brain", label: "Brain", Icon: Brain },
  { key: "Heart", label: "Heart", Icon: Heart },
  { key: "Leaf", label: "Leaf", Icon: Leaf },
  { key: "Stethoscope", label: "Stethoscope", Icon: Stethoscope },
  { key: "BarChart3", label: "Bar Chart", Icon: BarChart3 },
  { key: "ClipboardList", label: "Clipboard", Icon: ClipboardList },
  { key: "Scale", label: "Scale", Icon: Scale },
];

export type IconSelectorProps = {
  value: string;
  onChange: (val: string) => void;
};

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {ICONS.map(({ key, label, Icon }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={label}
            className={`flex flex-col items-center gap-1 rounded border px-2 py-2 hover:bg-gray-50 ${
              selected ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
            }`}
          >
            <Icon size={20} className={selected ? "text-indigo-700" : "text-gray-700"} />
            <span className="text-[11px] text-gray-700">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function getIconByKey(key?: string) {
  const found = ICONS.find((i) => i.key === key);
  return found?.Icon || Brain;
}
