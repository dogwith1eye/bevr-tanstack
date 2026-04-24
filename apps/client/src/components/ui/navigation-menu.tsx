"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Root component that groups all parts of the navigation menu.
 */
const NavigationMenu = React.forwardRef<
  HTMLElement,
  NavigationMenuPrimitive.Root.Props
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    data-slot="navigation-menu"
    className={cn("relative z-10 flex w-full items-center", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = "NavigationMenu";

/**
 * Container for the navigation menu list items.
 */
const NavigationMenuList = React.forwardRef<
  HTMLDivElement,
  NavigationMenuPrimitive.List.Props
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="navigation-menu-list"
    className={cn(
      "group flex flex-1 list-none items-center justify-start gap-1",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

/**
 * An individual item in the navigation menu.
 */
const NavigationMenuItem = NavigationMenuPrimitive.Item;

/**
 * The trigger button that toggles the visibility of the navigation menu popup.
 */
const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  NavigationMenuPrimitive.Trigger.Props
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    {...props}
    render={(triggerProps) => (
      <button
        {...triggerProps}
        data-slot="navigation-menu-trigger"
        className={cn(
          "group inline-flex h-9 w-max items-center justify-center bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted/50 data-[active]:bg-muted/50 rounded-none cursor-pointer",
          className,
        )}
      >
        {children}
        <ChevronDown
          className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </button>
    )}
  />
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

/**
 * Renders the navigation menu popup in a portal.
 */
const NavigationMenuPortal = NavigationMenuPrimitive.Portal;

/**
 * Positions the navigation menu popup relative to the trigger.
 */
const NavigationMenuPositioner = React.forwardRef<
  HTMLDivElement,
  NavigationMenuPrimitive.Positioner.Props
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Positioner
    ref={ref}
    data-slot="navigation-menu-positioner"
    className={cn("z-50", className)}
    {...props}
  />
));
NavigationMenuPositioner.displayName = "NavigationMenuPositioner";

/**
 * The popup container that holds the navigation menu content.
 */
const NavigationMenuPopup = React.forwardRef<
  HTMLElement,
  NavigationMenuPrimitive.Popup.Props
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Popup
    ref={ref}
    data-slot="navigation-menu-popup"
    className={cn(
      "mt-1.5 overflow-hidden border border-border bg-card text-card-foreground shadow-lg ring-1 ring-foreground/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 rounded-none min-w-[12rem] z-50",
      className,
    )}
    {...props}
  />
));
NavigationMenuPopup.displayName = "NavigationMenuPopup";

/**
 * The content area within a navigation menu popup.
 */
const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  NavigationMenuPrimitive.Content.Props
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="navigation-menu-content"
    className={cn("p-1 flex flex-col", className)}
    {...props}
  />
));
NavigationMenuContent.displayName = "NavigationMenuContent";

/**
 * An individual link within the navigation menu.
 */
const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  NavigationMenuPrimitive.Link.Props
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="navigation-menu-link"
    className={cn(
      "block select-none rounded-none p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground text-xs font-medium",
      className,
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuPortal,
  NavigationMenuPositioner,
  NavigationMenuPopup,
  NavigationMenuContent,
  NavigationMenuLink,
};
