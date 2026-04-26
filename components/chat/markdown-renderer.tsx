"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./code-block";

interface MarkdownRendererProps {
  content: string;
}

interface CodeProps extends ComponentPropsWithoutRef<"code"> {
  className?: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          if (match) {
            return (
              <CodeBlock language={match[1]} code={codeString} />
            );
          }

          return (
            <code
              className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        p({ children }: ComponentPropsWithoutRef<"p">) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }: ComponentPropsWithoutRef<"ul">) {
          return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }: ComponentPropsWithoutRef<"ol">) {
          return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>;
        },
        li({ children }: ComponentPropsWithoutRef<"li">) {
          return <li>{children}</li>;
        },
        strong({ children }: ComponentPropsWithoutRef<"strong">) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }: ComponentPropsWithoutRef<"em">) {
          return <em>{children}</em>;
        },
        a({ href, children }: ComponentPropsWithoutRef<"a">) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          );
        },
        blockquote({ children }: ComponentPropsWithoutRef<"blockquote">) {
          return (
            <blockquote className="border-l-4 border-primary pl-4 italic my-2">
              {children}
            </blockquote>
          );
        },
        h1({ children }: ComponentPropsWithoutRef<"h1">) {
          return <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>;
        },
        h2({ children }: ComponentPropsWithoutRef<"h2">) {
          return <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>;
        },
        h3({ children }: ComponentPropsWithoutRef<"h3">) {
          return <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
