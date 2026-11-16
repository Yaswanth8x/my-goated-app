import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Polymath OS — CEG ECE + Skills + Career",
  description: "Personal academic + professional operating system: CEG ECE + AI Professor + Course AI + PYQ Analyzer + Exam Trainer + Skill Mentor Network + Project Manager + Portfolio + Freelancing + Career + Polymath OS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <AuthProvider>
            <div className="flex min-h-screen">
              {/* Sidebar - Desktop */}
              <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
                <Sidebar />
              </aside>

              {/* Main Content */}
              <div className="flex-1 md:pl-64">
                <Header />
                <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
              </div>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
