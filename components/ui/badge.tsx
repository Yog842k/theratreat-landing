import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
};

export function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const base = "inline-flex items-center rounded-full text-xs font-medium";
  const variants = {
    default: "bg-blue-600 text-white px-2.5 py-1",
    outline: "border border-gray-300 text-gray-700 px-2.5 py-1 bg-white",
  } as const;
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export default Badge;
