"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./Card";
import { Button } from "./Button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">⚠️ Something went wrong</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                An error occurred in the application. This is not just "Something went wrong" — here's what happened and what to do.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">WHAT HAPPENED:</p>
                <p className="text-muted-foreground font-mono text-xs p-2 rounded bg-secondary overflow-auto">
                  {this.state.error?.message || "Unknown error"}
                </p>
              </div>
              <div>
                <p className="font-medium">WHY IT MAY HAVE HAPPENED:</p>
                <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                  <li>Missing environment variables — check .env, see SETUP.md</li>
                  <li>Supabase not configured — app runs in mock mode, but some features need Supabase</li>
                  <li>Network error — check internet, try again</li>
                  <li>Bug in code — report in GitHub issues with full error</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">WHAT TO DO:</p>
                <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                  <li>Check browser console for more details (F12 → Console)</li>
                  <li>Try reloading page</li>
                  <li>Check SETUP.md and TROUBLESHOOTING.md</li>
                  <li>If persists, copy error and say "FIX" to agent</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} size="sm">
                  Reload Page
                </Button>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
                  Go Home
                </Button>
              </div>
              {this.state.error?.stack && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">Stack trace (for debugging)</summary>
                  <pre className="mt-2 p-2 rounded bg-secondary overflow-auto text-[10px]">{this.state.error.stack}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
