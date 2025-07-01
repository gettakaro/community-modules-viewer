'use client';

import { useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import Image from 'next/image';

export interface MarkdownRendererProps {
  /** The markdown content to render */
  content: string;
  /** Optional CSS classes */
  className?: string;
  /** Whether to truncate content */
  truncate?: boolean;
  /** Number of lines to show when truncated */
  maxLines?: number;
}

/**
 * MarkdownRenderer component for safely rendering markdown content
 * with Takaro-themed styling applied to all elements
 */
export function MarkdownRenderer({
  content,
  className = '',
  truncate = false,
  maxLines = 3,
}: MarkdownRendererProps) {
  // Custom components for markdown elements with Takaro styling
  const components: Components = useMemo(
    () => ({
      // Headings
      h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-takaro-text-primary mb-4 mt-6 first:mt-0">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-xl font-semibold text-takaro-text-primary mb-3 mt-5 first:mt-0">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-lg font-semibold text-takaro-text-primary mb-2 mt-4 first:mt-0">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-base font-medium text-takaro-text-primary mb-2 mt-3 first:mt-0">
          {children}
        </h4>
      ),
      h5: ({ children }) => (
        <h5 className="text-sm font-medium text-takaro-text-primary mb-1 mt-2 first:mt-0">
          {children}
        </h5>
      ),
      h6: ({ children }) => (
        <h6 className="text-sm font-medium text-takaro-text-secondary mb-1 mt-2 first:mt-0">
          {children}
        </h6>
      ),

      // Paragraph
      p: ({ children }) => (
        <p className="text-takaro-text-secondary mb-3 last:mb-0">{children}</p>
      ),

      // Lists
      ul: ({ children }) => (
        <ul className="list-disc list-inside space-y-1 mb-3 text-takaro-text-secondary ml-4">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal list-inside space-y-1 mb-3 text-takaro-text-secondary ml-4">
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li className="text-takaro-text-secondary">{children}</li>
      ),

      // Links
      a: ({ href, children }) => (
        <a
          href={href}
          className="text-takaro-primary hover:text-takaro-primary-hover underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),

      // Code
      code: ({ children }) => {
        const isInline = !children?.toString().includes('\n');

        if (isInline) {
          return (
            <code className="px-1.5 py-0.5 rounded bg-takaro-card-hover text-takaro-primary text-sm font-mono">
              {children}
            </code>
          );
        }

        return (
          <code className="block p-4 rounded bg-takaro-card border border-takaro-border text-sm font-mono overflow-x-auto text-takaro-text-primary">
            {children}
          </code>
        );
      },
      pre: ({ children }) => (
        <pre className="mb-3 overflow-hidden rounded">{children}</pre>
      ),

      // Block quotes
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-takaro-primary pl-4 py-2 mb-3 italic text-takaro-text-secondary bg-takaro-card-hover rounded-r">
          {children}
        </blockquote>
      ),

      // Horizontal rule
      hr: () => <hr className="my-6 border-takaro-border" />,

      // Text formatting
      strong: ({ children }) => (
        <strong className="font-semibold text-takaro-text-primary">
          {children}
        </strong>
      ),
      em: ({ children }) => (
        <em className="italic text-takaro-text-secondary">{children}</em>
      ),

      // Tables
      table: ({ children }) => (
        <div className="overflow-x-auto mb-3">
          <table className="table-takaro w-full">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-takaro-card-hover">{children}</thead>
      ),
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => (
        <tr className="border-b border-takaro-border">{children}</tr>
      ),
      th: ({ children }) => (
        <th className="px-4 py-2 text-left font-medium text-takaro-text-primary">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-4 py-2 text-takaro-text-secondary">{children}</td>
      ),

      // Images (safely handled with Next.js Image)
      img: ({ src, alt }) => {
        // Ensure src is a string (react-markdown can pass Blob)
        const imageSrc = typeof src === 'string' ? src : '';

        if (!imageSrc) {
          return null;
        }

        return (
          <div className="relative w-full mb-3">
            <Image
              src={imageSrc}
              alt={alt || ''}
              width={800}
              height={600}
              className="max-w-full h-auto rounded"
              style={{ width: '100%', height: 'auto' }}
              unoptimized // Use unoptimized for external images without configuration
            />
          </div>
        );
      },
    }),
    [],
  );

  // Container classes for truncation
  const containerClasses = truncate
    ? {
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }
    : {};

  return (
    <div className={`markdown-content ${className}`} style={containerClasses}>
      <ReactMarkdown
        components={components}
        // Disable HTML to ensure safety
        skipHtml={true}
        // Only allow safe protocols
        allowedElements={undefined}
        unwrapDisallowed={false}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
