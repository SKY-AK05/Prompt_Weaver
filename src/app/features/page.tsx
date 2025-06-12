
"use client";
import AppHeader from "@/components/layout/app-header";
import FeaturesSection from "@/components/sections/features-section";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary text-center mb-12">Features</h1>
        <FeaturesSection />
      </main>
      {/* Footer is provided by RootLayout */}
    </div>
  );
}
