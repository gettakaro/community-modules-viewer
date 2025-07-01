'use client';

import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Import core PrismJS languages and plugins
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-bash';

// Import dark theme for PrismJS
import 'prismjs/themes/prism-tomorrow.css';

export interface CollapsibleCodeProps {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Title/label for the code block */
  title?: string;
  /** Whether the code block is initially expanded */
  defaultExpanded?: boolean;
  /** Maximum height when collapsed (in pixels) */
  maxCollapsedHeight?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show copy button */
  showCopy?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * CollapsibleCode component for displaying syntax-highlighted code
 * with expand/collapse functionality using PrismJS
 */
export function CollapsibleCode({
  code,
  language = 'javascript',
  title,
  defaultExpanded = false,
  maxCollapsedHeight = 150,
  className = '',
  showCopy = true,
  showLineNumbers = false,
}: CollapsibleCodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Check if content needs collapse functionality
  useEffect(() => {
    if (preRef.current) {
      const height = preRef.current.scrollHeight;
      setNeedsCollapse(height > maxCollapsedHeight);
    }
  }, [code, maxCollapsedHeight]);

  // Apply syntax highlighting
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language, isExpanded]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getLanguageClass = () => {
    // Map common language names to PrismJS class names
    const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'jsx',
      tsx: 'tsx',
      json: 'json',
      bash: 'bash',
      shell: 'bash',
      javascript: 'javascript',
      typescript: 'typescript',
    };

    return `language-${languageMap[language.toLowerCase()] || language}`;
  };

  return (
    <div className={`code-highlight overflow-hidden ${className}`}>
      {/* Header with title and controls */}
      {(title || showCopy || needsCollapse) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-takaro-border bg-takaro-card">
          <div className="flex items-center gap-2">
            {title && (
              <h4 className="text-sm font-medium text-takaro-text-primary">
                {title}
              </h4>
            )}
            {language && (
              <span className="badge-takaro-secondary text-xs">
                {language.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showCopy && (
              <button
                onClick={handleCopy}
                className="btn-takaro-outline text-xs px-2 py-1 h-auto min-h-0"
                title="Copy to clipboard"
                aria-label="Copy code to clipboard"
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            )}

            {needsCollapse && (
              <button
                onClick={toggleExpanded}
                className="btn-takaro-outline text-xs px-2 py-1 h-auto min-h-0"
                aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
                aria-expanded={isExpanded}
              >
                <span className="flex items-center gap-1">
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <pre
          ref={preRef}
          className={`
            !bg-takaro-card !border-0 !rounded-none overflow-auto text-sm
            ${showLineNumbers ? 'line-numbers' : ''}
          `}
          style={
            needsCollapse && !isExpanded
              ? { maxHeight: `${maxCollapsedHeight}px` }
              : undefined
          }
        >
          <code ref={codeRef} className={getLanguageClass()}>
            {code}
          </code>
        </pre>

        {/* Fade overlay when collapsed */}
        {needsCollapse && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-takaro-card to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand button overlay when collapsed */}
      {needsCollapse && !isExpanded && (
        <div className="text-center py-2 border-t border-takaro-border">
          <button
            onClick={toggleExpanded}
            className="btn-takaro-outline text-xs"
            aria-label="Expand code"
          >
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Show more
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CollapsibleCode;
