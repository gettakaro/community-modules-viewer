'use client';

import { useState, useEffect, useRef } from 'react';

// Import dark theme for PrismJS (loaded upfront for consistent styling)
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
  className = '',
  showCopy = true,
  showLineNumbers = false,
}: CollapsibleCodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const codeRef = useRef<HTMLElement>(null);

  // Lazy load PrismJS and apply syntax highlighting
  useEffect(() => {
    if (isExpanded && codeRef.current) {
      const loadPrismAndHighlight = async () => {
        setIsHighlighting(true);
        setHighlightError(null);

        try {
          // Dynamically import Prism and language modules
          const [{ default: Prism }] = await Promise.all([
            import('prismjs'),
            // Load language modules based on the language prop
            loadLanguageModule(language),
          ]);

          // Apply syntax highlighting
          if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
          }
        } catch (error) {
          console.error('Failed to load PrismJS or highlight code:', error);
          setHighlightError('Failed to load syntax highlighting');
        } finally {
          setIsHighlighting(false);
        }
      };

      loadPrismAndHighlight();
    }
  }, [code, language, isExpanded]);

  // Function to dynamically load language modules
  const loadLanguageModule = async (lang: string) => {
    const normalizedLang = lang.toLowerCase();

    try {
      switch (normalizedLang) {
        case 'javascript':
        case 'js':
          await import('prismjs/components/prism-javascript' as any);
          break;
        case 'typescript':
        case 'ts':
          await import('prismjs/components/prism-typescript' as any);
          break;
        case 'jsx':
          await import('prismjs/components/prism-jsx' as any);
          break;
        case 'tsx':
          // TSX requires TypeScript and JSX
          await Promise.all([
            import('prismjs/components/prism-typescript' as any),
            import('prismjs/components/prism-jsx' as any),
          ]);
          break;
        case 'json':
          await import('prismjs/components/prism-json' as any);
          break;
        case 'bash':
        case 'shell':
          await import('prismjs/components/prism-bash' as any);
          break;
        default:
          // For unknown languages, try to load the component
          try {
            await import(`prismjs/components/prism-${normalizedLang}` as any);
          } catch {
            // If the language module doesn't exist, just continue without it
            console.warn(
              `PrismJS language component for '${normalizedLang}' not found`,
            );
          }
      }
    } catch (error) {
      console.warn(
        `Failed to load PrismJS component for '${normalizedLang}':`,
        error,
      );
    }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 border-b border-takaro-border bg-takaro-card gap-2 sm:gap-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-medium text-takaro-text-primary truncate">
              {title}
            </h4>
          )}
          {language && (
            <span className="badge-takaro-secondary text-xs flex-shrink-0">
              {language.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
          {showCopy && (
            <button
              onClick={handleCopy}
              className="btn-takaro-outline text-xs px-3 py-2 sm:px-2 sm:py-1 h-auto min-h-0 min-w-[44px] touch-manipulation"
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

          <button
            onClick={toggleExpanded}
            className="btn-takaro-outline text-xs px-3 py-2 sm:px-2 sm:py-1 h-auto min-h-0 min-w-[44px] touch-manipulation"
            aria-label={isExpanded ? 'Hide code' : 'Show code'}
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
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </button>
        </div>
      </div>

      {/* Code content - only show when expanded */}
      {isExpanded && (
        <div className="relative">
          {/* Loading state */}
          {isHighlighting && (
            <div className="absolute inset-0 bg-takaro-card/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-takaro-text-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-takaro-accent border-t-transparent"></div>
                <span className="text-sm">Loading syntax highlighting...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {highlightError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3 m-2">
              <div className="flex items-center gap-2 text-red-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm">{highlightError}</span>
              </div>
            </div>
          )}

          <pre
            className={`
              !bg-takaro-card !border-0 !rounded-none overflow-auto text-xs sm:text-sm
              ${showLineNumbers ? 'line-numbers' : ''}
              ${isHighlighting ? 'opacity-50' : ''}
              p-3 sm:p-4
            `}
          >
            <code ref={codeRef} className={getLanguageClass()}>
              {code}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default CollapsibleCode;
