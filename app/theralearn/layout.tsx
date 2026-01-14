import { ReactNode } from "react";
import { TheraLearnHeader } from "@/components/theralearn/TheraLearnHeader";

export default function TheraLearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/40">
      <TheraLearnHeader />
      {children}
    </div>
  );
}
