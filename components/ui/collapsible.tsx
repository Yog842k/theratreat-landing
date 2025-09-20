"use client";
import * as React from "react";

type CollapsibleContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null);

export function Collapsible({ open, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(!!open);

  React.useEffect(() => {
    if (typeof open === "boolean") setInternalOpen(open);
  }, [open]);

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <CollapsibleContext.Provider value={{ open: internalOpen, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return children;
  const { open, setOpen } = ctx;
  const props = {
    onClick: () => setOpen(!open),
  } as const;
  return asChild ? React.cloneElement(children, { ...props }) : <button {...props}>{children}</button>;
}

export function CollapsibleContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return <>{children}</>;
  return ctx.open ? <>{children}</> : null;
}
