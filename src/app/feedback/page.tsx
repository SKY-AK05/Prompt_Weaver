
"use client";
import AppHeader from "@/components/layout/app-header";
import FeedbackSection from "@/components/sections/feedback-section";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {/* The FeedbackSection itself has a title, so a separate H1 might be redundant depending on styling preference */}
        {/* <h1 className="text-4xl font-bold text-primary text-center mb-12">Provide Feedback</h1> */}
        <FeedbackSection />
      </main>
      {/* Footer is provided by RootLayout */}
    </div>
  );
}
