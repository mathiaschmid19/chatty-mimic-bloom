import React, { useState } from "react";
import { User, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export type MessageRole = "user" | "assistant";

// Consistent brand colors
const BRAND_COLORS = {
  primary: "#3B82F6", // Main brand color (blue)
  secondary: "#F9FAFB", // Light background for assistant messages
  accent: "#6366F1", // Accent color for assistant avatar
  textPrimary: "#1F2937", // Dark text
  textLight: "#FFFFFF", // White text
  border: "#E5E7EB", // Light border color
};

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: string;
}

const detectLanguage = (code: string): string => {
  // First check if there's a language specified in the first line
  const firstLine = code.split("\n")[0].toLowerCase().trim();

  // Common language indicators with their aliases
  const languageMap: { [key: string]: string } = {
    html: "html",
    xml: "html",
    htm: "html",
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    typescript: "typescript",
    py: "python",
    python: "python",
    rb: "ruby",
    ruby: "ruby",
    java: "java",
    c: "c",
    cpp: "cpp",
    "c++": "cpp",
    cs: "csharp",
    "c#": "csharp",
    php: "php",
    go: "go",
    rust: "rust",
    swift: "swift",
    kotlin: "kotlin",
    scala: "scala",
    sql: "sql",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
    sh: "bash",
    bash: "bash",
    shell: "bash",
    dockerfile: "dockerfile",
    docker: "dockerfile",
  };

  // Check for explicit language declaration in the first line
  for (const [key, value] of Object.entries(languageMap)) {
    if (firstLine.includes(key)) {
      return value;
    }
  }

  // Enhanced HTML detection patterns
  const htmlPatterns = [
    /<!DOCTYPE\s+html/i,
    /<html[^>]*>/i,
    /<head[^>]*>/i,
    /<body[^>]*>/i,
    /<div[^>]*>/i,
    /<span[^>]*>/i,
    /<p[^>]*>/i,
    /<a[^>]*>/i,
    /<img[^>]*>/i,
    /<script[^>]*>/i,
    /<style[^>]*>/i,
  ];

  for (const pattern of htmlPatterns) {
    if (pattern.test(code)) {
      return "html";
    }
  }

  // Enhanced JavaScript detection patterns
  const jsPatterns = [
    /\b(function|const|let|var|class|import|export|return|if|else|for|while|switch|case|break|continue)\b/,
    /=>\s*{/,
    /\.then\(/,
    /async\s+function/,
    /new\s+Promise/,
  ];

  for (const pattern of jsPatterns) {
    if (pattern.test(code)) {
      return "javascript";
    }
  }

  // Enhanced Python detection patterns
  const pythonPatterns = [
    /\b(def|class|import|from|return|if|else|for|while|try|except|with|as)\b/,
    /:\s*$/m,
    /print\s*\(/,
    /__init__/,
  ];

  for (const pattern of pythonPatterns) {
    if (pattern.test(code)) {
      return "python";
    }
  }

  // Default to text if no language is detected
  return "text";
};

const formatText = (text: string, isUser: boolean) => {
  // Split into paragraphs
  const paragraphs = text.split("\n\n");

  return paragraphs.map((paragraph, index) => {
    // Handle headings
    if (paragraph.startsWith("### ")) {
      return (
        <h3
          key={index}
          className={`text-base leading-6 font-bold my-4 ${
            isUser ? "text-white" : "text-gray-800 dark:text-white"
          }`}
        >
          {paragraph.slice(4)}
        </h3>
      );
    }

    // Handle h4 headings
    if (paragraph.startsWith("#### ")) {
      return (
        <h4
          key={index}
          className={`text-sm leading-6 font-semibold my-3 ${
            isUser ? "text-white" : "text-gray-800 dark:text-white"
          }`}
        >
          {paragraph.slice(5)}
        </h4>
      );
    }

    // Handle bold text
    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
      return (
        <p
          key={index}
          className={`my-2 font-bold ${
            isUser ? "text-white" : "text-gray-800 dark:text-white"
          }`}
        >
          {paragraph.slice(2, -2)}
        </p>
      );
    }

    // Handle inline code
    if (paragraph.startsWith("`") && paragraph.endsWith("`")) {
      const code = paragraph.slice(1, -1);
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm ${
            isUser ? "text-white" : "text-gray-800 dark:text-white"
          }`}
        >
          {code}
        </code>
      );
    }

    // Handle tables
    if (paragraph.includes("|") && paragraph.includes("-")) {
      const lines = paragraph.split("\n").filter((line) => line.trim());
      if (lines.length < 2) return null;

      const header = lines[0]
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      const rows = lines.slice(2).map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
      );

      return (
        <div key={index} className="my-4 overflow-x-auto">
          <table
            className={`min-w-full border-collapse ${
              isUser ? "text-white" : "text-gray-800 dark:text-white"
            }`}
          >
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {header.map((cell, i) => (
                  <th
                    key={i}
                    className={`px-4 py-2 text-left font-semibold text-sm ${
                      isUser ? "text-white" : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {cell.replace(/\*\*/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    rowIndex % 2 === 0
                      ? isUser
                        ? "bg-blue-600/10"
                        : "bg-gray-50 dark:bg-gray-700/50"
                      : ""
                  }`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2 text-sm ${
                        isUser ? "text-white" : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {cell.replace(/\*\*/g, "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Handle lists
    if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
      const items = paragraph.split("\n");
      return (
        <ul key={index} className="list-disc list-inside my-2 space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className={
                isUser ? "text-white" : "text-gray-800 dark:text-white"
              }
            >
              {item.replace(/^[-*]\s+/, "")}
            </li>
          ))}
        </ul>
      );
    }

    // Regular paragraph with potential bold text
    const formattedParagraph = paragraph
      .split(/(\*\*.*?\*\*)/)
      .map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="font-bold">
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      });

    return (
      <p
        key={index}
        className={`my-2 ${
          isUser ? "text-white" : "text-gray-800 dark:text-white"
        }`}
      >
        {formattedParagraph}
      </p>
    );
  });
};

const formatMessage = (content: string, isUser: boolean) => {
  // Check if the content contains code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Split the content into parts, preserving code blocks
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add the code block
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push({
      type: "code",
      language,
      content: code,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  // Render the parts
  return parts.map((part, index) => {
    if (part.type === "text") {
      // Handle regular text content
      return formatText(part.content, isUser);
    } else if (part.type === "code") {
      // Handle code blocks
      return (
        <div key={index} className="my-4 relative group">
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
              {part.language}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(part.content);
                toast.success("Code copied to clipboard!");
              }}
              className="p-1.5 rounded-md bg-gray-800/50 hover:bg-gray-800 text-white"
              title="Copy code"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <SyntaxHighlighter
            language={part.language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              padding: "1rem",
              background: "#1e1e1e",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: "0.875rem",
                lineHeight: "1.5",
              },
            }}
            showLineNumbers={true}
            wrapLines={true}
            lineNumberStyle={{
              color: "#666",
              marginRight: "1rem",
              userSelect: "none",
            }}
          >
            {part.content}
          </SyntaxHighlighter>
        </div>
      );
    }
  });
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = role === "user";
  const { isCollapsed } = useSidebar();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start w-full"}`}>
      <div
        className={cn(
          "chat-message",
          role,
          "flex flex-col p-3 rounded-lg",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-50 dark:bg-gray-800 w-full",
          isCollapsed ? "max-w-[95%]" : "max-w-[85%]"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="prose dark:prose-invert max-w-none flex-1">
            {formatMessage(content, isUser)}
          </div>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Copy message"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
