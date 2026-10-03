"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "./UserMenu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 gap-3">
        {/* Mobile Menu Button — Polished */}
        <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Search - Desktop with Cmd+K hint — Polished */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search courses, docs, chats… (⌘K) — Part 118 preview"
              className="w-full pl-9 pr-16 py-2 rounded-lg border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-muted-foreground/70"
              onFocus={() => {
                console.log("Command bar — Part 118 preview, future global search across courses/docs/conversations/projects");
              }}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-secondary text-[10px] font-medium">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-secondary text-[10px] font-medium">K</kbd>
            </div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="md:hidden flex-1 flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-semibold text-[13px] truncate">POLYMATH OS — 100%</span>
        </div>

        {/* Actions — Polished */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" title="Notifications — Part 119 preview, future Supabase Realtime" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          </Button>
          <UserMenu />
        </div>
      </div>

      {/* Mobile Menu — Polished */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-3 space-y-1 animate-in slide-in-from-top-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search… (⌘K preview)"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {[
            { href: "/", label: "HOME" },
            { href: "/academics", label: "ACADEMICS" },
            { href: "/workspaces", label: "WORKSPACES 📦 NEW" },
            { href: "/ai-hub", label: "AI HUB ⭐ CORE", highlight: true },
            { href: "/skills", label: "SKILLS" },
            { href: "/projects", label: "PROJECTS" },
            { href: "/portfolio", label: "PORTFOLIO" },
            { href: "/freelancing", label: "FREELANCING" },
            { href: "/career", label: "CAREER + ORCHESTRATOR" },
            { href: "/documents", label: "DOCUMENTS" },
            { href: "/analytics", label: "ANALYTICS" },
            { href: "/settings", label: "SETTINGS" },
            { href: "/settings/backup", label: "BACKUP / EXPORT" },
            { href: "/admin", label: "ADMIN" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block py-2.5 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                item.highlight ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
