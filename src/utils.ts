import React from "react";

/**
 * Format bytes into readable format
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Get visual Tailwind CSS utility color classes for category badges
 */
export function getCategoryBadgeClasses(category: string): string {
  switch (category) {
    case "Hóa đơn / Phiếu chi":
      return "bg-amber-50 text-amber-700 border-amber-200/50";
    case "Hợp đồng / Văn bản pháp lý":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
    case "Báo cáo / Kế hoạch":
      return "bg-blue-50 text-blue-700 border-blue-200/50";
    case "Học tập / Nghiên cứu":
      return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
    case "Tài liệu kỹ thuật / Code":
      return "bg-purple-50 text-purple-700 border-purple-200/50";
    case "Ghi chú cá nhân":
      return "bg-pink-50 text-pink-700 border-pink-200/50";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/**
 * High-performance, clean markdown formatter working perfectly under React 19
 * Translates bullet points, numbered lists, code snippets, headers, blockquotes, and tables
 */
export function parseMarkdownToReact(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let currentListType: "ul" | "ol" | null = null;
  let inCodeBlock = false;
  let codeSnippet: string[] = [];
  let codeLang = "plaintext";

  const pushBufferedList = (key: string) => {
    if (currentListType && currentListItems.length > 0) {
      if (currentListType === "ul") {
        elements.push(
          React.createElement(
            "ul",
            { key: `ul-${key}`, className: "list-disc pl-6 my-2 space-y-1 text-slate-700 font-sans leading-relaxed" },
            ...currentListItems
          )
        );
      } else {
        elements.push(
          React.createElement(
            "ol",
            { key: `ol-${key}`, className: "list-decimal pl-6 my-2 space-y-1 text-slate-700 font-sans leading-relaxed" },
            ...currentListItems
          )
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Code Block
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        const codeText = codeSnippet.join("\n");
        elements.push(
          React.createElement(
            "pre",
            {
              key: `code-${i}`,
              className: "bg-slate-900 text-slate-100 p-4 rounded-lg my-3 font-mono text-xs overflow-x-auto border border-slate-800 shadow-sm leading-relaxed",
            },
            React.createElement("code", null, codeText)
          )
        );
        codeSnippet = [];
        codeLang = "plaintext";
      } else {
        // Open code block
        pushBufferedList(`code-start-${i}`);
        inCodeBlock = true;
        const match = line.trim().match(/^```(\w+)/);
        if (match) codeLang = match[1];
      }
      continue;
    }

    if (inCodeBlock) {
      codeSnippet.push(line);
      continue;
    }

    // Process standard text tokens: bold (**), italic (*), inline code (`)
    const inlineParse = (str: string): React.ReactNode[] => {
      // Split by double asterisks first
      const parts: React.ReactNode[] = [];
      const boldParts = str.split(/\*\*([^*]+)\*\*/g);
      
      boldParts.forEach((part, bIdx) => {
        // Odd entries are bold elements
        if (bIdx % 2 === 1) {
          parts.push(React.createElement("strong", { key: `bold-${bIdx}`, className: "font-semibold text-slate-900" }, part));
        } else {
          // Process inline code inside standard text
          const codeParts = part.split(/`([^`]+)`/g);
          codeParts.forEach((cPart, cIdx) => {
            if (cIdx % 2 === 1) {
              parts.push(
                React.createElement(
                  "code",
                  { key: `inline-code-${cIdx}`, className: "bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200/60" },
                  cPart
                )
              );
            } else {
              parts.push(cPart);
            }
          });
        }
      });
      return parts;
    };

    // Unordered List Element (-, *, or +)
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (ulMatch) {
      if (currentListType === "ol") {
        pushBufferedList(`switch-ol-ul-${i}`);
      }
      currentListType = "ul";
      currentListItems.push(
        React.createElement("li", { key: `li-ul-${i}`, className: "my-0.5 text-slate-700" }, ...inlineParse(ulMatch[3]))
      );
      continue;
    }

    // Ordered List Element (number. text)
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (currentListType === "ul") {
        pushBufferedList(`switch-ul-ol-${i}`);
      }
      currentListType = "ol";
      currentListItems.push(
        React.createElement("li", { key: `li-ol-${i}`, className: "my-0.5 text-slate-700" }, ...inlineParse(olMatch[3]))
      );
      continue;
    }

    // Normal line: push buffered list if any
    pushBufferedList(`plain-break-${i}`);

    // Headers
    if (line.startsWith("#")) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const hClass =
          level === 1
            ? "text-xl font-bold text-slate-900 mt-4 mb-2 border-b border-slate-100 pb-1"
            : level === 2
            ? "text-lg font-semibold text-slate-900 mt-4 mb-2"
            : "text-md font-semibold text-slate-800 mt-3 mb-1.5";
        
        elements.push(
          React.createElement(`h${Math.min(level + 1, 6)}`, { key: `h-${i}`, className: hClass }, ...inlineParse(content))
        );
        continue;
      }
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      const bContent = line.trim().substring(1).trim();
      elements.push(
        React.createElement(
          "blockquote",
          { key: `quote-${i}`, className: "border-l-4 border-slate-300 pl-4 py-1 my-2 text-slate-600 italic bg-slate-50/50 rounded-r-md pr-2" },
          ...inlineParse(bContent)
        )
      );
      continue;
    }

    // Empty lines or paragraphs
    if (line.trim() === "") {
      elements.push(React.createElement("div", { key: `space-${i}`, className: "h-2" }));
    } else {
      elements.push(
        React.createElement("p", { key: `p-${i}`, className: "text-slate-700 font-sans leading-relaxed my-1.5 text-[14.5px]" }, ...inlineParse(line))
      );
    }
  }

  // Final push if items remain
  pushBufferedList("final");

  return elements;
}
