
"use client";

import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Trash2, PlusCircle, MoreHorizontal, Copy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  prompt_text: string;
  prompt_level: string;
  refined_prompt_text_1: string | null;
  refined_prompt_rating_1: number | null;
  refined_prompt_text_2: string | null;
  refined_prompt_rating_2: number | null;
  refined_prompt_text_3: string | null;
  refined_prompt_rating_3: number | null;
  is_favorite: boolean;
  created_at: string;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch prompts from Supabase
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          toast({
            title: "Login Required",
            description: "Please log in to view your prompts.",
            variant: "destructive",
          });
          window.location.href = "/login";
          return;
        }

        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPrompts(data || []);
      } catch (error) {
        console.error("Error fetching prompts:", error);
        toast({
          title: "Error",
          description: "Failed to load prompts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Filter prompts based on active tab
  const filteredPrompts = activeTab === "favorites"
    ? prompts.filter((prompt) => prompt.is_favorite)
    : prompts;

  // Toggle expanded state for refined prompts
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({ is_favorite: !currentFavorite })
        .eq("id", id);

      if (error) throw error;

      setPrompts((prev) =>
        prev.map((prompt) =>
          prompt.id === id ? { ...prompt, is_favorite: !currentFavorite } : prompt
        )
      );
      toast({
        title: "Success",
        description: `Prompt ${!currentFavorite ? "added to" : "removed from"} favorites.`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  // Delete prompt
  const deletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      toast({
        title: "Success",
        description: "Prompt deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt.",
        variant: "destructive",
      });
    }
  };

  // Copy refined prompt to clipboard
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Prompt copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy prompt.",
          variant: "destructive",
        });
      });
  };

  // Get rating color based on value
  const getRatingColor = (rating: number | null) => {
    if (rating === null) return "text-muted-foreground";
    if (rating >= 9) return "text-green-600";
    if (rating >= 7) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <main className="pt-[var(--header-height)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">My Prompts</h1>
              <Button asChild>
                <Link href="/">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create New Prompt
                </Link>
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                onClick={() => setActiveTab("all")}
                className="px-4 py-2 text-sm font-medium"
              >
                All Prompts
              </Button>
              <Button
                variant={activeTab === "favorites" ? "default" : "ghost"}
                onClick={() => setActiveTab("favorites")}
                className="px-4 py-2 text-sm font-medium"
              >
                Favorite Prompts
              </Button>
            </div>

            {/* Prompt Cards Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading prompts...</p>
              </div>
            ) : filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="bg-background border-muted hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <CardContent className="pt-6 flex-grow">
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg mb-2 truncate">
                            {prompt.prompt_text.slice(0, 30) + (prompt.prompt_text.length > 30 ? "..." : "")}
                          </h3>
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                            {prompt.prompt_level}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(prompt.id, prompt.is_favorite)}
                          className="hover:bg-muted"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              prompt.is_favorite
                                ? "text-primary fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>

                      {/* Original Prompt */}
                      <div className="mb-6">
                        <p className="text-sm text-primary font-medium mb-2">Original Prompt:</p>
                        <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3">
                          {prompt.prompt_text}
                        </p>
                      </div>

                      {/* Refined Prompts */}
                      {expandedCards.has(prompt.id) && (
                        <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-sm text-primary font-medium mb-4">Refined Prompts:</p>
                          <div className="space-y-4">
                            {[
                              {
                                text: prompt.refined_prompt_text_1,
                                rating: prompt.refined_prompt_rating_1,
                                id: `${prompt.id}-1`,
                              },
                              {
                                text: prompt.refined_prompt_text_2,
                                rating: prompt.refined_prompt_rating_2,
                                id: `${prompt.id}-2`,
                              },
                              {
                                text: prompt.refined_prompt_text_3,
                                rating: prompt.refined_prompt_rating_3,
                                id: `${prompt.id}-3`,
                              },
                            ]
                              .filter((refined) => refined.text)
                              .map((refined, index) => (
                                <div key={refined.id} className="border-l-2 border-muted pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                      Refined {index + 1}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-muted-foreground">★</span>
                                      <span className={`text-sm font-semibold ${getRatingColor(refined.rating)}`}>
                                        {refined.rating ?? "N/A"}/10
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3">
                                    {refined.text}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(refined.text!)}
                                    className="mt-2 text-muted-foreground hover:text-primary"
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t border-muted pt-3 pb-3">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(prompt.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary hover:underline"
                          onClick={() => toggleExpanded(prompt.id)}
                        >
                          {expandedCards.has(prompt.id) ? "Show Less" : "Show More"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="col-span-full text-center py-4 bg-background border-muted">
                <CardContent>
                  <p className="text-lg font-medium text-foreground mb-2">
                    {activeTab === "favorites" ? "No favorite prompts found" : "No saved prompts yet"}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Start creating and saving prompts to see them here!
                  </p>
                  <Button asChild>
                    <Link href="/">Create Your First Prompt</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
