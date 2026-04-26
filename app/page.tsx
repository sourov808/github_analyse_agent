"use client";

import { useState } from "react";
import {
  GitBranch,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { GitHubUrlInput } from "@/components/github-url-input";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Header } from "@/components/header";
import { UploadProgress } from "@/components/upload-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UPLOAD_STEPS = [
  "Connecting to GitHub",
  "Fetching repository files",
  "Processing and indexing code",
  "Ready to analyze",
];

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

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
    setCurrentStep(0);
    setRepoName(extractRepoName(url));
    setRepoUrl(url);

    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 3) {
          return prev + 1;
        }
        clearInterval(progressInterval);
        return prev;
      });
    }, 800);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      await response.json();
      clearInterval(progressInterval);
      setCurrentStep(3);

      toast.success("Repository analyzed successfully!", {
        description: `Now you can ask questions about ${repoName}`,
        duration: 4000,
      });

      setTimeout(() => {
        setIsAnalyzing(false);
        setIsReady(true);
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze repository";
      setError(errorMessage);
      toast.error("Analysis failed", {
        description: errorMessage,
        duration: 5000,
      });
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIsReady(false);
    setRepoUrl("");
    setRepoName("");
    setCurrentStep(0);
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 flex flex-col px-4 py-6 md:py-8 max-w-7xl mx-auto w-full pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-6 md:mb-8 flex-shrink-0">
          <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-2xl bg-primary/10 mb-3">
            <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            GitHub Repository Analyzer
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Paste a GitHub repository URL to analyze its codebase with AI
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 flex-shrink-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 pb-8">
          {/* Left Panel - Repository & Status */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 flex-shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
            {/* URL Input Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Repository</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <GitHubUrlInput
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </CardContent>
            </Card>

            {isAnalyzing && (
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-semibold">Analyzing...</h3>
                    <p className="text-xs text-muted-foreground">
                      Please wait while we process
                    </p>
                  </div>
                  <UploadProgress
                    currentStep={currentStep}
                    steps={UPLOAD_STEPS}
                  />
                </CardContent>
              </Card>
            )}

            {isReady && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Current Repository
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-primary bg-muted px-3 py-2 rounded-md truncate">
                      {repoUrl}
                    </p>
                    <p className="text-xs text-muted-foreground">{repoName}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Ready for queries
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card (shown only when idle) */}
            {!isAnalyzing && !isReady && (
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold mb-3">
                    What you can do:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Explore code architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Understand relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Find implementations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>AI-powered analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="flex-1 min-h-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-10rem)]">
            {isReady ? (
              <Card className="h-full rounded-lg border shadow-sm flex flex-col">
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                  <ChatInterface repositoryName={repoName} />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full rounded-lg border shadow-sm flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="p-6 md:p-8 rounded-full bg-muted">
                    <GitBranch className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto px-4">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      Ready to Analyze
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a GitHub repository URL on the left to get started with AI-powered code analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8 pt-4 border-t text-center text-xs md:text-sm text-muted-foreground flex-shrink-0">
          <p>Powered by LangChain, Groq, and Qdrant vector database</p>
        </div>
      </div>
    </main>
  );
}
