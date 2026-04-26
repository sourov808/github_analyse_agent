"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative group my-3">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyToClipboard}
          title="Copy code"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-4">
        <code className={`language-${language} text-sm`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
