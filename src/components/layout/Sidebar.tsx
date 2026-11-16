"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  Brain,
  FolderKanban,
  Briefcase,
  User,
  FileText,
  Bot,
  BarChart3,
  Settings,
  BookOpen,
  Sparkles,
  Shield,
  Download,
  Folder,
} from "lucide-react";

const navigation = [
  { name: "HOME", href: "/", icon: Home },
  { name: "ACADEMICS", href: "/academics", icon: GraduationCap },
  { name: "WORKSPACES", href: "/workspaces", icon: Folder },
  { name: "SKILLS", href: "/skills", icon: Brain },
  { name: "PROJECTS", href: "/projects", icon: FolderKanban },
  { name: "PORTFOLIO", href: "/portfolio", icon: Briefcase },
  { name: "FREELANCING", href: "/freelancing", icon: User },
  { name: "CAREER", href: "/career", icon: BookOpen },
  { name: "DOCUMENTS", href: "/documents", icon: FileText },
  { name: "AI HUB", href: "/ai-hub", icon: Bot, highlight: true },
  { name: "ANALYTICS", href: "/analytics", icon: BarChart3 },
  { name: "SETTINGS", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo — Polished */}
      <div className="p-5 border-b">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-[13px] tracking-tight">POLYMATH OS</h1>
            <p className="text-[11px] text-muted-foreground">CEG ECE + Skills + Career</p>
          </div>
        </Link>
      </div>

      {/* Navigation — Polished */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : item.highlight
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              `}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
            </Link>
          );
        })}

        {/* Secondary — Admin, Backup — polished */}
        <div className="pt-4 mt-4 border-t space-y-0.5">
          <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground tracking-wider">SYSTEM</p>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              pathname.startsWith("/admin") ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Shield className="w-[18px] h-[18px]" />
            ADMIN
          </Link>
          <Link
            href="/settings/backup"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              pathname.startsWith("/settings/backup") ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Download className="w-[18px] h-[18px]" />
            BACKUP
          </Link>
        </div>
      </nav>

      {/* Footer — Polished 100% */}
      <div className="p-3 border-t">
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-900/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">DEMO MODE</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600 text-white font-medium">mock</span>
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 leading-tight">
            Runs without Supabase or AI keys. Data is not saved to a real database.
          </p>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border text-amber-700 dark:text-amber-300">Mock AI</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border text-amber-700 dark:text-amber-300">Local data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
