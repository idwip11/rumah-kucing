"use client";

import { useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
  label,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <span className="text-xs font-medium text-gray-500">
          {label ?? "Markdown"}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "edit"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "preview"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-none border-0 p-3 text-sm text-gray-800 focus:outline-none"
        />
      ) : (
        <div className="prose prose-sm max-w-none p-3 text-sm text-gray-800">
          {value ? (
            <>
              {value.split("\n\n").map((block, i) => {
                const trimmed = block.trim();
                if (!trimmed) return null;

                // Bold
                if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                  return (
                    <p key={i} className="mb-1 font-bold">
                      {trimmed.slice(2, -2)}
                    </p>
                  );
                }

                // Inline bold
                const withBold = trimmed.replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong>$1</strong>",
                );

                // Check if it looks like a list item
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  const items = trimmed
                    .split(/\n(?=- |\* )/)
                    .map((item) => {
                      const clean = item.replace(/^- |\* /, "");
                      return `<li>${clean.replace(
                        /\*\*(.*?)\*\*/g,
                        "<strong>$1</strong>",
                      )}</li>`;
                    })
                    .join("");
                  return (
                    <ul key={i} className="mb-1 ml-5 list-disc">
                      {items
                        .split("</li>")
                        .filter(Boolean)
                        .map((li, j) => (
                          <li
                            key={j}
                            className="mb-0.5"
                            dangerouslySetInnerHTML={{
                              __html: li.replace(/<\/?li>/g, "") + "</li>",
                            }}
                          />
                        ))}
                    </ul>
                  );
                }

                // Regular paragraph
                return (
                  <p key={i} className="mb-2 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: withBold }} />
                  </p>
                );
              })}
            </>
          ) : (
            <p className="text-gray-400 italic">Kosong - tidak ada preview.</p>
          )}
        </div>
      )}

      {/* Help hint */}
      <div className="border-t border-gray-100 bg-gray-50 px-3 py-1.5">
        <p className="text-[10px] text-gray-400">
          Format: **tebal** untuk bold, baris baru untuk paragraf, dash item
          untuk daftar
        </p>
      </div>
    </div>
  );
}
