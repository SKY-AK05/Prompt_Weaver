
"use client";
import AppHeader from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-foreground/90 text-left space-y-4">
            <p>Welcome to PromptWeaver!</p>
            <p>These terms and conditions outline the rules and regulations for the use of PromptWeaver's Website, located at [Your Website URL].</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use PromptWeaver if you do not agree to take all of the terms and conditions stated on this page.</p>
            <h3 className="text-xl font-semibold text-primary">Cookies</h3>
            <p>We employ the use of cookies. By accessing PromptWeaver, you agreed to use cookies in agreement with the PromptWeaver's Privacy Policy.</p>
            <h3 className="text-xl font-semibold text-primary">License</h3>
            <p>Unless otherwise stated, PromptWeaver and/or its licensors own the intellectual property rights for all material on PromptWeaver. All intellectual property rights are reserved. You may access this from PromptWeaver for your own personal use subjected to restrictions set in these terms and conditions.</p>
            <p>You must not:</p>
            <ul>
              <li>Republish material from PromptWeaver</li>
              <li>Sell, rent or sub-license material from PromptWeaver</li>
              <li>Reproduce, duplicate or copy material from PromptWeaver</li>
              <li>Redistribute content from PromptWeaver</li>
            </ul>
            <p>This Agreement shall begin on the date hereof.</p>
            <p>[More terms to be added here...]</p>
            <p><strong>Last updated: {new Date().toLocaleDateString()}</strong></p>
          </CardContent>
        </Card>
      </main>
      {/* Footer removed from here, will be provided by RootLayout */}
    </div>
  );
}
