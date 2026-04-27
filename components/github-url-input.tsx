"use client";

import { useState } from "react";
import { GitBranch, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GitHubUrlInputProps {
  onAnalyze: (url: string, collectionName?: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function GitHubUrlInput({ onAnalyze, isAnalyzing }: GitHubUrlInputProps) {
  const [url, setUrl] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState("");

  const validateGitHubUrl = (value: string): boolean => {
    if (!value.trim()) {
      setError("Repository URL is required");
      return false;
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/)?$/;
    if (!githubRegex.test(value)) {
      setError("Please enter a valid GitHub repository URL");
      return false;
    }

    setError("");
    return true;
  };

  const validateCollectionName = (value: string): boolean => {
    if (!value.trim()) {
      // Allow empty, will use default
      return true;
    }
    const collectionRegex = /^[a-zA-Z0-9_-]{1,255}$/;
    if (!collectionRegex.test(value)) {
      setError("Collection name can only contain letters, numbers, hyphens, and underscores (1-255 characters)");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateGitHubUrl(url)) {
      return;
    }

    if (collectionName.trim() && !validateCollectionName(collectionName)) {
      return;
    }

    try {
      await onAnalyze(url.trim(), collectionName.trim() || undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze repository";
      toast.error(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (error) {
      validateGitHubUrl(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <GitBranch className="h-5 w-5" />
        </div>
        <Input
          type="url"
          placeholder="https://github.com/owner/repository"
          value={url}
          onChange={handleChange}
          disabled={isAnalyzing}
          className={`pl-10 pr-10 h-12 text-base ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? "url-error" : undefined}
        />
        {isAnalyzing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {error && url && (
        <div className="flex items-center gap-2 text-sm text-destructive" id="url-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Input
          type="text"
          placeholder="Collection name (optional, default: github-analyzer)"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          disabled={isAnalyzing}
          className="h-10 text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave blank to use default collection. Use alphanumeric, hyphens, and underscores only.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isAnalyzing || !url.trim()}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Repository...
          </>
        ) : (
          <>
            <GitBranch className="mr-2 h-4 w-4" />
            Analyze Repository
          </>
        )}
      </Button>
    </form>
  );
}
