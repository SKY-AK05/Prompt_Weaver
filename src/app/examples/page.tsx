
"use client";
import AppHeader from "@/components/layout/app-header";
import ExamplesSection from "@/components/sections/examples-section";

export default function ExamplesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
         <h1 className="text-4xl font-bold text-primary text-center mb-12">Prompt Examples</h1>
        <ExamplesSection />
      </main>
      {/* Footer is provided by RootLayout */}
    </div>
  );
}
