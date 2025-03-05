"use client";

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";

// Initialize Prism
if (typeof window !== "undefined") {
  Prism.manual = true;
}

export const renderCode = (code: string) => {
  // Use useEffect to apply syntax highlighting after component mount
  // but we can pre-highlight here for server rendering
  const highlightedCode =
    typeof window !== "undefined"
      ? Prism.highlight(code, Prism.languages.javascript, "javascript")
      : code;

  return (
    <div className="relative group">
      <pre className="bg-background-alt dark:bg-dark-background-alt p-4 rounded-md overflow-x-auto text-sm">
        <code
          className="language-javascript"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
      <button
        className="absolute top-2 right-2 bg-background dark:bg-dark-background hover:bg-background-alt dark:hover:bg-dark-background-alt p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => navigator.clipboard.writeText(code)}
        aria-label="Copy code"
      >
        <span className="text-xs">Copy</span>
      </button>
    </div>
  );
};