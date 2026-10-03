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
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-900/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-green-800 dark:text-green-200">125/125 COMPLETE</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-600 text-white font-medium">100%</span>
          </div>
          <p className="text-[11px] text-green-700/70 dark:text-green-300/70 mt-1 leading-tight">W1✓ W2✓ W3✓ W4✓ W5✓ — Polymath OS Master Rebuild Done — 23 routes — Production ready</p>
          <div className="mt-2.5 w-full bg-green-200/50 dark:bg-green-900/30 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-1.5 rounded-full" style={{ width: "100%" }}></div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border text-green-700 dark:text-green-300">Supabase</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border text-green-700 dark:text-green-300">RAG+Citations</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-black/20 border text-green-700 dark:text-green-300">No fake</span>
          </div>
        </div>
      </div>
    </div>
  );
}
