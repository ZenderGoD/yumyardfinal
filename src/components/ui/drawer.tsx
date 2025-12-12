"use client";

import * as React from "react";
import {
  Content as DrawerContentPrimitive,
  Drawer as VaulDrawer,
  Overlay as DrawerOverlayPrimitive,
  Portal as DrawerPortalPrimitive,
  Root as DrawerRoot,
} from "vaul";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

const Drawer = DrawerRoot;
const DrawerTrigger = VaulDrawer.Trigger;
const DrawerPortal = DrawerPortalPrimitive;
const DrawerClose = VaulDrawer.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerOverlayPrimitive>,
  React.ComponentPropsWithoutRef<typeof DrawerOverlayPrimitive>
>(({ className, ...props }, ref) => (
  <DrawerOverlayPrimitive
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerOverlayPrimitive.displayName;

type DrawerSide = "bottom" | "top" | "left" | "right";

type DrawerContentProps = React.ComponentPropsWithoutRef<typeof DrawerContentPrimitive> & {
  side?: DrawerSide;
};

const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerContentPrimitive>, DrawerContentProps>(
  ({ className, children, side = "bottom", ...props }, ref) => {
    const base = "fixed z-50 border border-[var(--border)] bg-white shadow-2xl outline-none";
    const sideClasses: Record<DrawerSide, string> = {
      bottom:
        "inset-x-0 bottom-0 mt-24 flex h-auto flex-col rounded-t-3xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
      top:
        "inset-x-0 top-0 mb-16 flex h-auto flex-col rounded-b-3xl sm:bottom-auto sm:left-1/2 sm:top-12 sm:max-w-2xl sm:-translate-x-1/2 sm:translate-y-0 sm:rounded-3xl",
      left:
        "inset-y-0 left-0 flex h-full w-[90vw] max-w-md flex-col rounded-r-3xl sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:-translate-y-1/2",
      right:
        "inset-y-0 right-0 flex h-full w-[90vw] max-w-md flex-col rounded-l-3xl sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:-translate-y-1/2",
    };

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerContentPrimitive
          ref={ref}
          className={cn(base, sideClasses[side], className)}
          {...props}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300/70" />
          {children}
        </DrawerContentPrimitive>
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = DrawerContentPrimitive.displayName;

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1 px-4 pt-3 text-left", className)} {...props} />
);

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex flex-col gap-2 px-4 pb-4", className)} {...props} />
);

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Title>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Title>
>(({ className, ...props }, ref) => (
  <VaulDrawer.Title
    ref={ref}
    className={cn("text-lg font-semibold text-[#2c2218]", className)}
    {...props}
  />
));
DrawerTitle.displayName = VaulDrawer.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Description>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Description>
>(({ className, ...props }, ref) => (
  <VaulDrawer.Description
    ref={ref}
    className={cn("text-sm text-[#52473a]", className)}
    {...props}
  />
));
DrawerDescription.displayName = VaulDrawer.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerOverlay,
};

