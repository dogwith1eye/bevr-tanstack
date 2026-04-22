import { useState } from "react";
import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { ChatBox } from "./components/chat-box";
import { GithubIcon } from "./components/icon/Github";
import { PresencePanel } from "./components/presence-panel";
import { RestCard } from "./components/rest-card";
import { RpcCard } from "./components/rpc-card";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "./components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./components/ui/navigation-menu";

type Panel = "chat" | "presence" | "rest" | "rpc";

const PANELS: { value: Panel; label: string }[] = [
  { value: "chat", label: "Chat" },
  { value: "presence", label: "Presence" },
  { value: "rest", label: "REST" },
  { value: "rpc", label: "RPC" },
];

function App() {
  const [activePanel, setActivePanel] = useState<Panel>("chat");

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
      </div>

      <div className="text-center">
        <h1 className="font-black text-5xl">bEvr</h1>
        <h2 className="font-bold text-2xl">Bun + Effect + Vite + React</h2>
        <p className="text-muted-foreground">A typesafe fullstack monorepo</p>
      </div>

      <div className="w-full">
        <NavigationMenu className="border-b border-border w-full">
          <NavigationMenuList>
            {PANELS.map(({ value, label }) => (
              <NavigationMenuItem key={value}>
                <NavigationMenuLink
                  active={activePanel === value}
                  render={<button type="button" />}
                  onClick={() => setActivePanel(value)}
                  className="border-b-2 border-transparent data-[active]:border-primary rounded-none pb-2"
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="pt-6 min-h-[30rem]">
          {activePanel === "chat" && <ChatBox />}
          {activePanel === "presence" && <PresencePanel className="h-full" />}
          {activePanel === "rest" && <RestCard />}
          {activePanel === "rpc" && <RpcCard />}
        </div>
      </div>

      <footer className="w-full flex justify-between">
        <Button
          variant="link"
          render={(props) => (
            <a
              {...props}
              href="https://www.lloydrichards.dev"
              target="_blank"
              rel="noopener"
            >
              lloydrichards.dev
            </a>
          )}
        />
        <Button
          variant="link"
          render={(props) => (
            <a
              {...props}
              href="https://github.com/lloydrichards/base_bevr-stack"
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

export default App;
