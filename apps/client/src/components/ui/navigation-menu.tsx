import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function NavigationMenu({
  className,
  ...props
}: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("group/navigation-menu relative flex items-center", className)}
      {...props}
    />
  );
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        "group/trigger inline-flex h-8 items-center gap-1.5 rounded-none px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:bg-muted data-[popup-open]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuIcon />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuIcon({
  className,
  ...props
}: NavigationMenuPrimitive.Icon.Props) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-icon"
      className={cn(
        "size-3 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "absolute top-0 left-0 w-max p-2 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: NavigationMenuPrimitive.Viewport.Props) {
  return (
    <NavigationMenuPrimitive.Positioner sideOffset={4} align="start">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative overflow-hidden border border-border bg-popover text-popover-foreground shadow-md transition-[width,height,transform,opacity] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      />
    </NavigationMenuPrimitive.Positioner>
  );
}

const navigationMenuLinkVariants = cva(
  "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "h-8 px-2.5 rounded-none text-foreground hover:bg-muted hover:text-foreground data-[active]:bg-muted data-[active]:text-foreground",
        ghost:
          "h-8 px-2.5 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground data-[active]:bg-muted data-[active]:text-foreground",
        link: "text-primary underline-offset-4 hover:underline data-[active]:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function NavigationMenuLink({
  className,
  variant = "default",
  ...props
}: NavigationMenuPrimitive.Link.Props &
  VariantProps<typeof navigationMenuLinkVariants>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navigationMenuLinkVariants({ variant }), className)}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIcon,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuLinkVariants,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};
