"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { LogOut, Settings, User, Sparkles } from "lucide-react";
import { useState } from "react";

export function UserMenu() {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
          {user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden md:inline text-sm">{user.user_metadata?.display_name || user.email?.split("@")[0]}</span>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-card shadow-lg p-2 z-50">
          <div className="p-3 border-b">
            <p className="font-medium text-sm">{user.user_metadata?.display_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isSupabaseConfigured ? "✅ Real Auth (Supabase)" : "⚠️ Mock Auth"} • ID: {user.id.slice(0, 8)}...
            </p>
          </div>

          <div className="p-1 space-y-1">
            <Link href="/settings" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link href="/settings/ai-providers" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Providers
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="p-2 border-t mt-1">
            <p className="text-[10px] text-muted-foreground">Polymath OS • Workspace 2 Complete • 50/125 parts</p>
          </div>
        </div>
      )}
    </div>
  );
}
