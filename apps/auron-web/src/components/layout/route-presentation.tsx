"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const DrawerPresentationContext = createContext(false);

export function useDrawerPresentation() {
  return useContext(DrawerPresentationContext);
}

export function RouteDrawer({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <SheetContent
        title={title}
        description={description}
        className="!w-full sm:!w-[min(720px,calc(100vw-24px))]"
      >
        <DrawerPresentationContext.Provider value>
          {children}
        </DrawerPresentationContext.Provider>
      </SheetContent>
    </Sheet>
  );
}
