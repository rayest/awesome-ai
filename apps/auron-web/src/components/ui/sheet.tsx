"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const sideVariants = {
  right: "right-0 top-0 h-full w-[480px] data-[state=open]:slide-in-from-right",
  left: "left-0 top-0 h-full w-[480px] data-[state=open]:slide-in-from-left",
} as const;

export interface SheetContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  side?: keyof typeof sideVariants;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", title, description, className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-[var(--card)] shadow-2xl border-l border-[var(--hairline)]",
        "flex flex-col",
        sideVariants[side],
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:duration-200 data-[state=open]:duration-300",
        className
      )}
      {...props}
    >
      <div className="px-6 py-4 border-b border-[var(--hairline)] flex items-start justify-between">
        <div className="min-w-0">
          {title && (
            <DialogPrimitive.Title className="font-display text-[18px] font-medium tracking-tight text-[var(--ink)]">
              {title}
            </DialogPrimitive.Title>
          )}
          {description && (
            <DialogPrimitive.Description className="mt-1 text-[12px] text-[var(--ink-mute)] font-mono">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close className="w-8 h-8 rounded-md hover:bg-[var(--accent)] flex items-center justify-center text-[var(--ink-dim)] shrink-0">
          <X className="w-4 h-4" />
        </DialogPrimitive.Close>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

