
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Star, MessageSquare } from "lucide-react"; // Using MessageSquare
import { cn } from "@/lib/utils";

export default function FeedbackSection() {
  const [rating, setRating] = React.useState(0);
  const [suggestion, setSuggestion] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 && !suggestion.trim()) {
      toast({
        title: "Feedback Incomplete",
        description: "Please provide a rating or a suggestion.",
        variant: "destructive",
      });
      return;
    }
    console.log({ rating, suggestion, email });
    setSubmitted(true);
    toast({
      title: "Feedback Submitted!",
      description: "Thanks! Your feedback helps us improve PromptWeaver.",
    });
    setTimeout(() => {
        setRating(0);
        setSuggestion("");
        setEmail("");
        setSubmitted(false);
    }, 3000)
  };

  if (submitted) {
    return (
      <section className="w-full py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Card className="max-w-xl mx-auto shadow-lg bg-card rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">🎉 Thanks!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-card-foreground/90">
                Your feedback helps us improve PromptWeaver.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-xl mx-auto shadow-lg bg-card rounded-lg">
          <CardHeader className="text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-primary mb-3" /> {/* Changed Icon */}
            <CardTitle className="text-3xl font-bold text-primary">We’d Love Your Feedback</CardTitle>
            <CardDescription className="text-muted-foreground">
              Help us make PromptWeaver even better!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="rating" className="block text-sm font-medium text-card-foreground mb-2 text-left">
                  Rate your experience (1-5 stars)
                </Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setRating(star)}
                      className={cn(
                        "rounded-full border-primary text-primary hover:bg-primary/10",
                        rating >= star && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      aria-label={`Rate ${star} star`}
                    >
                      <Star className={cn("h-5 w-5", rating >= star && "fill-current")} />
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="suggestion" className="block text-sm font-medium text-card-foreground mb-1 text-left">
                  Suggest improvements
                </Label>
                <Textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="What can we do better?"
                  rows={4}
                  className="text-base bg-background border-input text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1 text-left">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="text-base bg-background border-input text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>

              <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md">
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
