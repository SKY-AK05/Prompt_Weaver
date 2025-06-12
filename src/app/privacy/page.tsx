
"use client";
import AppHeader from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none text-foreground/90 text-left space-y-4">
            <p>Your privacy is important to us. It is PromptWeaver's policy to respect your privacy regarding any information we may collect from you across our website, [Your Website URL], and other sites we own and operate.</p>
            <h3 className="text-xl font-semibold text-primary">Information We Collect</h3>
            <p>Log data: When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</p>
            <p>Device data: We may also collect data about the device you’re using to access our website. This data may include the device type, operating system, unique device identifiers, device settings, and geo-location data.</p>
            <p>Personal information: We may ask for personal information, such as your name and email address.</p>
            <h3 className="text-xl font-semibold text-primary">Use of Information</h3>
            <p>We may use the information we collect for a variety of purposes, including to:</p>
            <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                <li>Send you emails</li>
                <li>Find and prevent fraud</li>
            </ul>
            <p>[More privacy policy details to be added here...]</p>
            <p><strong>Last updated: {new Date().toLocaleDateString()}</strong></p>
          </CardContent>
        </Card>
      </main>
      {/* Footer removed from here, will be provided by RootLayout */}
    </div>
  );
}
