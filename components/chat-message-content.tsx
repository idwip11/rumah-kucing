"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageContentProps {
  content: string;
  role: "assistant" | "user";
}

/**
 * Clean up raw text or bullet lists formatted with '•' characters
 * into standard Markdown syntax.
 */
function normalizeMarkdown(text: string): string {
  if (!text) return "";

  let formatted = text;

  // Replace inline bullet points like "• item 1 • item 2" into line-separated markdown bullets
  // First, if bullets appear on the same line separated by spaces or dots:
  formatted = formatted.replace(/ • /g, "\n- ");

  // Convert leading bullet symbols '•' at line start into markdown list '- '
  formatted = formatted.replace(/^[ \t]*•[ \t]*/gm, "- ");

  return formatted;
}

export function ChatMessageContent({ content, role }: ChatMessageContentProps) {
  const normalizedText = normalizeMarkdown(content);

  if (role === "user") {
    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert break-words text-foreground font-normal leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="mb-5 last:mb-0 leading-[1.75] text-[15px]">{children}</p>;
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold mt-8 mb-4 first:mt-0 text-foreground tracking-tight border-b border-border/40 pb-2">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold mt-7 mb-3.5 first:mt-0 text-foreground tracking-tight">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-6 mb-2.5 first:mt-0 text-foreground">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className="my-5 pl-6 list-disc space-y-2.5 text-[15px] marker:text-primary/70">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-5 pl-6 list-decimal space-y-2.5 text-[15px] marker:text-primary/70">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-[1.75] pl-1">{children}</li>;
          },
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-5 border-l-4 border-primary/60 bg-primary/5 px-4 py-3 rounded-r-lg text-muted-foreground text-[14px] leading-relaxed italic">
                {children}
              </blockquote>
            );
          },
          code({ inline, className, children, ...props }: any) {
            if (inline) {
              return (
                <code
                  className="rounded bg-muted-foreground/15 px-1.5 py-0.5 font-mono text-[0.82em] font-medium text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-3.5 text-slate-100 shadow-inner">
                <code className="font-mono text-xs leading-relaxed" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-md border border-border">
                <table className="w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/70 font-semibold">{children}</thead>;
          },
          th({ children }) {
            return <th className="border-b border-border p-2.5 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="border-b border-border/50 p-2.5">{children}</td>;
          },
          hr() {
            return <hr className="my-4 border-border/60" />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
}
