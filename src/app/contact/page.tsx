
"use client";
import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual contact form submission
    toast({
      title: "Message Sent (Placeholder)",
      description: "Thank you for contacting us! We'll get back to you soon.",
    });
    // Optionally reset form fields
  };
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Contact Us</CardTitle>
            <CardDescription>Have questions or feedback? Reach out to us!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Your Name" required className="mt-1 text-base" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required className="mt-1 text-base" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" type="text" placeholder="Regarding..." required className="mt-1 text-base" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." required rows={5} className="mt-1 text-base" />
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      {/* Footer removed from here, will be provided by RootLayout */}
    </div>
  );
}
