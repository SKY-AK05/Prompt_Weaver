"use client";

import AppHeader from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Trash2, PlusCircle, MoreHorizontal, Copy, Save, SaveOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  is_temporary: boolean;
  expires_at: string;
  created_at: string;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "favorites">("all");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
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

        const now = new Date();
        const promptsToDelete = (data || []).filter(prompt =>
          prompt.is_temporary && new Date(prompt.expires_at) < now
        );

        if (promptsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("prompts")
            .delete()
            .in("id", promptsToDelete.map(p => p.id));

          if (deleteError) {
            console.error("Error deleting expired prompts:", deleteError);
            toast({
              title: "Cleanup Failed",
              description: "Failed to delete some expired prompts.",
              variant: "destructive",
            });
          }
        }

        setPrompts((data || []).filter(prompt =>
          !prompt.is_temporary || new Date(prompt.expires_at) >= now
        ));
        if (data && data.length > 0) {
          // Set selectedPrompt only after cleanup to ensure it's not an expired one
          const nonExpiredPrompts = (data || []).filter(prompt =>
            !prompt.is_temporary || new Date(prompt.expires_at) >= now
          );
          setSelectedPrompt(nonExpiredPrompts.length > 0 ? nonExpiredPrompts[0] : null);
        }
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
    : activeTab === "saved"
    ? prompts.filter((prompt) => !prompt.is_temporary)
    : prompts;

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({ is_favorite: !currentFavorite, is_temporary: false })
        .eq("id", id);

      if (error) throw error;

      setPrompts((prev) => {
        const updatedPrompts = prev.map((prompt) =>
          prompt.id === id ? { ...prompt, is_favorite: !currentFavorite } : prompt
        );
        return updatedPrompts;
      });

      // Also update selectedPrompt if it's the one being toggled
      setSelectedPrompt((prevSelected) =>
        prevSelected && prevSelected.id === id
          ? { ...prevSelected, is_favorite: !currentFavorite }
          : prevSelected
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

      setPrompts((prev) => {
        const updatedPrompts = prev.filter((prompt) => prompt.id !== id);
        // If the deleted prompt was the selected one, clear selection or pick a new one
        if (selectedPrompt && selectedPrompt.id === id) {
          setSelectedPrompt(updatedPrompts.length > 0 ? updatedPrompts[0] : null);
        }
        return updatedPrompts;
      });

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

  const handleSaveSelectedPrompt = async () => {
    if (!selectedPrompt) {
      toast({ title: "No Prompt Selected", description: "Please select a prompt to save/unsave.", variant: "destructive" });
      return;
    }
    
    const newTemporaryStatus = !selectedPrompt.is_temporary;
    let newExpiresAt: string | null = selectedPrompt.expires_at;
    let updateData: { is_temporary: boolean; expires_at?: string | null; } = { is_temporary: newTemporaryStatus };

    if (newTemporaryStatus) { // If setting to temporary (unsaving)
      if (selectedPrompt.is_favorite) {
        toast({ title: "Cannot Unsave Favorite", description: "Favorited prompts cannot be reverted to temporary status.", variant: "default" });
        return;
      }
      const now = new Date();
      const calculatedExpiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
      newExpiresAt = calculatedExpiresAt.toISOString();
      updateData.expires_at = newExpiresAt;
    } else { // If setting to permanent (saving)
      // No need to update expires_at explicitly, it remains as is or can be set to null if desired for permanent prompts
      // For now, we'll keep the existing expires_at or set it to null if it makes sense for permanent data
      updateData.expires_at = null; // Clear expires_at for permanent prompts
    }

    try {
      const { error } = await supabase
        .from("prompts")
        .update(updateData)
        .eq("id", selectedPrompt.id);

      if (error) throw error;

      setPrompts((prev) =>
        prev.map((prompt) =>
          prompt.id === selectedPrompt.id 
            ? { ...prompt, is_temporary: newTemporaryStatus, expires_at: newExpiresAt || prompt.expires_at } 
            : prompt
        )
      );
      setSelectedPrompt((prevSelected) =>
        prevSelected 
          ? { ...prevSelected, is_temporary: newTemporaryStatus, expires_at: newExpiresAt || prevSelected.expires_at } 
          : null
      );
      toast({
        title: "Success",
        description: newTemporaryStatus ? "Prompt reverted to temporary." : "Prompt saved permanently.",
      });
    } catch (error) {
      console.error("Error saving/unsaving prompt:", error);
      toast({
        title: "Error",
        description: `Failed to ${newTemporaryStatus ? 'revert' : 'save'} prompt.`, 
        variant: "destructive",
      });
    }
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
                All Prompts <span className="ml-2 text-xs font-semibold">{prompts.length}</span>
              </Button>
              <Button
                variant={activeTab === "saved" ? "default" : "ghost"}
                onClick={() => setActiveTab("saved")}
                className="px-4 py-2 text-sm font-medium"
              >
                Saved Prompts <span className="ml-2 text-xs font-semibold">{prompts.filter(p => !p.is_temporary).length}</span>
              </Button>
              <Button
                variant={activeTab === "favorites" ? "default" : "ghost"}
                onClick={() => setActiveTab("favorites")}
                className="px-4 py-2 text-sm font-medium"
              >
                Favorites <span className="ml-2 text-xs font-semibold">{prompts.filter(p => p.is_favorite).length}</span>
              </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)]">
              {/* Left Column: Prompt List */}
              <div className="w-full md:w-1/3 border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
                <h2 className="text-lg font-semibold px-4 pt-4">{filteredPrompts.length} Prompts</h2>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading prompts...</p>
                  </div>
                ) : filteredPrompts.length > 0 ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredPrompts.map((prompt) => (
                      <Card
                        key={prompt.id}
                        className={cn(
                          "bg-background border border-muted hover:shadow-lg transition-all duration-300 cursor-pointer",
                          selectedPrompt?.id === prompt.id && "border-primary ring-2 ring-primary/50"
                        )}
                        onClick={() => handlePromptSelect(prompt)}
                      >
                        <CardContent className="pt-4 pb-2">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                              <h3 className="font-semibold text-foreground text-base truncate">
                                {prompt.prompt_text.slice(0, 30) + (prompt.prompt_text.length > 30 ? "..." : "")}
                              </h3>
                              <div className="flex items-center text-sm mt-1">
                                <span className="px-2 py-0.5 mr-2 bg-muted text-muted-foreground text-xs font-medium rounded">
                                  {prompt.prompt_level}
                                </span>
                                {prompt.refined_prompt_rating_1 !== null && (
                                  <span className={`text-xs font-semibold ${getRatingColor(prompt.refined_prompt_rating_1)}`}>
                                    ⭐ {prompt.refined_prompt_rating_1}/10
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                toggleFavorite(prompt.id, prompt.is_favorite);
                              }}
                              className="hover:bg-muted"
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  prompt.is_favorite ? "text-primary fill-primary" : "text-muted-foreground"
                                )}
                              />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {prompt.prompt_text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(prompt.created_at).toLocaleDateString()}
                            {prompt.refined_prompt_text_1 && <span className="ml-2"> • 1 refined</span>}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No prompts found.</p>
                    <Button asChild className="mt-4">
                      <Link href="/">Create one</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Prompt Detail */}
              <div className="w-full md:w-2/3 border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
                {!selectedPrompt ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                    <img src="/images/empty-state-placeholder.svg" alt="Select a prompt" className="w-24 h-24 mb-4 opacity-70" />
                    <p className="text-lg font-semibold">Select a prompt to view</p>
                    <p className="text-sm">Choose a prompt from the list to see its details and refined versions.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{selectedPrompt.prompt_text.slice(0, 50)}</h2>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span className="px-2 py-0.5 mr-2 bg-muted text-muted-foreground text-xs font-medium rounded">
                            {selectedPrompt.prompt_level}
                          </span>
                          {selectedPrompt.refined_prompt_rating_1 !== null && (
                            <span className={`text-xs font-semibold ${getRatingColor(selectedPrompt.refined_prompt_rating_1)}`}>
                              ⭐ {selectedPrompt.refined_prompt_rating_1}/10
                            </span>
                          )}
                          <span className="ml-4">Created {new Date(selectedPrompt.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedPrompt.id, selectedPrompt.is_favorite)}>
                          <Star
                            className={cn(
                              "h-5 w-5",
                              selectedPrompt.is_favorite ? "text-primary fill-primary" : "text-muted-foreground"
                            )}
                          />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePrompt(selectedPrompt.id)}>
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={handleSaveSelectedPrompt}
                          disabled={!selectedPrompt || (selectedPrompt.is_favorite && !selectedPrompt.is_temporary)}
                        >
                          {selectedPrompt?.is_temporary ? (
                            <><Save className="mr-2 h-4 w-4" />Save</>
                          ) : (
                            <><SaveOff className="mr-2 h-4 w-4" />Unsave</>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* Original Prompt Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Original Prompt</h3>
                        <div className="bg-muted/30 p-3 rounded-md flex justify-between items-start">
                          <p className="text-foreground text-sm flex-1 pr-2">{selectedPrompt.prompt_text}</p>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPrompt.prompt_text)}>
                            <Copy className="h-4 w-4 mr-1" />Copy
                          </Button>
                        </div>
                      </div>

                      {/* Refined Prompts Section */}
                      {selectedPrompt.refined_prompt_text_1 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Refined Prompts (1)</h3>
                          <div className="space-y-4">
                            <Card className="bg-muted/30">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-muted-foreground">Version 1</span>
                                  {selectedPrompt.refined_prompt_rating_1 !== null && (
                                    <span className={`text-xs font-semibold ${getRatingColor(selectedPrompt.refined_prompt_rating_1)}`}>
                                      ⭐ {selectedPrompt.refined_prompt_rating_1}/10
                                    </span>
                                  )}
                                </div>
                                <p className="text-foreground text-sm mb-3">{selectedPrompt.refined_prompt_text_1}</p>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPrompt.refined_prompt_text_1 || '')}>
                                    <Copy className="h-4 w-4 mr-1" />Copy
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                      {/* Add more refined prompts if available (refined_prompt_text_2, refined_prompt_text_3) */}
                      {selectedPrompt.refined_prompt_text_2 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Refined Prompts (2)</h3>
                          <div className="space-y-4">
                            <Card className="bg-muted/30">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-muted-foreground">Version 2</span>
                                  {selectedPrompt.refined_prompt_rating_2 !== null && (
                                    <span className={`text-xs font-semibold ${getRatingColor(selectedPrompt.refined_prompt_rating_2)}`}>
                                      ⭐ {selectedPrompt.refined_prompt_rating_2}/10
                                    </span>
                                  )}
                                </div>
                                <p className="text-foreground text-sm mb-3">{selectedPrompt.refined_prompt_text_2}</p>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPrompt.refined_prompt_text_2 || '')}>
                                    <Copy className="h-4 w-4 mr-1" />Copy
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                      {selectedPrompt.refined_prompt_text_3 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Refined Prompts (3)</h3>
                          <div className="space-y-4">
                            <Card className="bg-muted/30">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-muted-foreground">Version 3</span>
                                  {selectedPrompt.refined_prompt_rating_3 !== null && (
                                    <span className={`text-xs font-semibold ${getRatingColor(selectedPrompt.refined_prompt_rating_3)}`}>
                                      ⭐ {selectedPrompt.refined_prompt_rating_3}/10
                                    </span>
                                  )}
                                </div>
                                <p className="text-foreground text-sm mb-3">{selectedPrompt.refined_prompt_text_3}</p>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPrompt.refined_prompt_text_3 || '')}>
                                    <Copy className="h-4 w-4 mr-1" />Copy
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
