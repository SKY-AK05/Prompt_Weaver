
"use client";
import AppHeader from "@/components/layout/app-header";
import HowItWorksSection from "@/components/sections/how-it-works-section";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary text-center mb-12">How It Works</h1>
        <HowItWorksSection />
      </main>
      {/* Footer is provided by RootLayout */}
    </div>
  );
}
