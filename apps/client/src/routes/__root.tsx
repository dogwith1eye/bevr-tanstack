import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import bun from "../assets/bun.svg";
import effect from "../assets/effect.svg";
import react from "../assets/react.svg";
import tanstack from "../assets/tanstack.svg";
import vite from "../assets/vite.svg";
import { GithubIcon } from "../components/icon/Github";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../components/ui/navigation-menu";

type Panel = "/chat" | "/presence" | "/rest" | "/rpc";

const PANELS: { value: Panel; label: string }[] = [
  { value: "/chat", label: "Chat" },
  { value: "/presence", label: "Presence" },
  { value: "/rest", label: "REST" },
  { value: "/rpc", label: "RPC" },
];


export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-8 p-4">
      <ThemeToggle />
      <div className="flex items-center gap-6">
        <img alt="Bun logo" height={64} src={bun} width={64} />
        <img
          alt="Effect logo"
          height={64}
          src={effect}
          width={64}
          className="dark:invert"
        />
        <img alt="Vite logo" height={64} src={vite} width={64} />
        <img alt="React logo" height={64} src={react} width={64} />
        <img
          alt="TanStack logo"
          height={64}
          src={tanstack}
          width={64}
        />
      </div>

      <div className="text-center">
        <h1 className="font-black text-5xl">bEvrTS</h1>
        <h2 className="font-bold text-2xl">Bun + Effect + Vite + React + TanStack</h2>
        <p className="text-muted-foreground">A typesafe fullstack monorepo</p>
      </div>

      <div className="w-full">
        <NavigationMenu className="border-b border-border w-full">
          <NavigationMenuList>
            {PANELS.map(({ value, label }) => (
              <NavigationMenuItem key={value}>
                <NavigationMenuLink render={<Link to={value} activeProps={{ 'data-active': '' }} />}>
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </div>

      <footer className="w-full flex justify-between">
        <Button
          variant="link"
          render={(props) => (
            <a
              {...props}
              href="https://www.dogwith1eye.dev"
              target="_blank"
              rel="noopener"
            >
              dogwith1eye.dev
            </a>
          )}
        />
        <Button
          variant="link"
          render={(props) => (
            <a
              {...props}
              href="https://github.com/dogwith1eye/bevr-tanstack"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              Github
            </a>
          )}
        />
      </footer>
    </div>
  );
}