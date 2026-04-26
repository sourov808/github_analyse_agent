"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./chat-input";
import { ChatMessageItem, ChatMessage } from "./chat-message-item";
import { GitBranch, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChatInterfaceProps {
  repositoryName: string;
  repoUrl?: string;
}

export function ChatInterface({ repositoryName, repoUrl }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (query: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsQueryLoading(true);

    try {
      const response = await fetch("/api/ag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from agent");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.AI || "No response received",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to process your request"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {repositoryName}
            </CardTitle>
            <CardDescription className="truncate">
              {repoUrl || "GitHub Repository"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea 
          className="flex-1 p-4"
          ref={scrollRef as never}
        >
          {messages.length === 0 && !isQueryLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 rounded-full bg-muted mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Analyzing</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask questions about the repository&apos;s codebase, architecture, or specific files.
                The AI assistant will search through the code to provide accurate answers.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isLoading={isQueryLoading && message.id === messages[messages.length - 1]?.id && message.role === "assistant" && messages[messages.length - 1] !== message}
                />
              ))}
              {isQueryLoading && messages[messages.length - 1]?.role === "user" && (
                <ChatMessageItem
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                  }}
                  isLoading
                />
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              placeholder="Ask a question about this repository..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
