"use client";

import { useState } from "react";
import { GitBranch, Loader2, AlertCircle } from "lucide-react";
import { GitHubUrlInput } from "@/components/github-url-input";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [repoName, setRepoName] = useState("");

  const extractRepoName = (url: string): string => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    if (match) {
      const parts = match[1].split("/");
      return `${parts[0]} / ${parts[1]}`;
    }
    return url;
  };

  const handleAnalyze = async (url: string) => {
    setError("");
    setIsAnalyzing(true);
    setRepoUrl(url);
    setRepoName(extractRepoName(url));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Wait for the response - indexing happens on server
      await response.json();

      setIsAnalyzing(false);
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze repository");
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 mb-4">
            <GitBranch className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            GitHub Repository Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a GitHub repository URL to analyze its codebase. Ask questions and get AI-powered insights about the repository structure, implementation details, and more.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* URL Input Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-2xl font-semibold text-center">
                Enter Repository URL
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Supports public GitHub repositories. Private repos require a GitHub token configured in the backend.
              </p>
            </div>
            <GitHubUrlInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </CardContent>
        </Card>

        {/* Loading/Indexing State */}
        {(isAnalyzing || isIndexing) && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <h3 className="text-lg font-semibold">
                    {isIndexing ? "Indexing Repository..." : "Analyzing Repository..."}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/5 bg-muted rounded animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fetching repository files, splitting into chunks, and storing in vector database. This may take a few moments.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {isReady && !isIndexing && (
          <div className="max-w-5xl mx-auto h-[600px] md:h-[700px]">
            <ChatInterface
              repoUrl={repoUrl}
              isLoadingRepo={isIndexing}
              repositoryName={repoName}
            />
          </div>
        )}
      </div>
    </main>
  );
}
