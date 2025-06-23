"use client";
import AppHeader, { useAuth, AuthProvider } from '@/components/layout/app-header';
import PromptWeaverClient from '@/components/client/prompt-weaver-client';

// This file is no longer needed as the tool is integrated into src/app/page.tsx
// You can safely delete this file.
// If you get a build error because of this file, delete it from your project.
export default function ToolPage() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <PromptWeaverClient isLoggedIn={!!user} />
        </main>
      </div>
    </AuthProvider>
  );
}
