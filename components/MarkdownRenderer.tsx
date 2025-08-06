'use client';

import React, { useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import {
  ReactNode,
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  HTMLAttributes,
} from 'react';
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
      h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h1
          {...props}
          className="text-2xl font-bold text-takaro-text-primary mb-4 mt-6 first:mt-0"
        >
          {children}
        </h1>
      ),
      h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h2
          {...props}
          className="text-xl font-semibold text-takaro-text-primary mb-3 mt-5 first:mt-0"
        >
          {children}
        </h2>
      ),
      h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h3
          {...props}
          className="text-lg font-semibold text-takaro-text-primary mb-2 mt-4 first:mt-0"
        >
          {children}
        </h3>
      ),
      h4: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h4
          {...props}
          className="text-base font-medium text-takaro-text-primary mb-2 mt-3 first:mt-0"
        >
          {children}
        </h4>
      ),
      h5: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h5
          {...props}
          className="text-sm font-medium text-takaro-text-primary mb-1 mt-2 first:mt-0"
        >
          {children}
        </h5>
      ),
      h6: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
        <h6
          {...props}
          className="text-sm font-medium text-takaro-text-secondary mb-1 mt-2 first:mt-0"
        >
          {children}
        </h6>
      ),

      // Paragraph
      p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
        <div {...props} className="text-takaro-text-secondary mb-3 last:mb-0">
          {children}
        </div>
      ),

      // Lists
      ul: ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
        <ul
          {...props}
          className="list-disc list-inside space-y-1 mb-3 text-takaro-text-secondary ml-4"
        >
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: HTMLAttributes<HTMLOListElement>) => (
        <ol
          {...props}
          className="list-decimal list-inside space-y-1 mb-3 text-takaro-text-secondary ml-4"
        >
          {children}
        </ol>
      ),
      li: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
        <li {...props} className="text-takaro-text-secondary">
          {children}
        </li>
      ),

      // Links
      a: ({
        href,
        children,
        ...props
      }: AnchorHTMLAttributes<HTMLAnchorElement> & {
        children?: ReactNode;
      }) => (
        <a
          {...props}
          href={href}
          className="text-takaro-primary hover:text-takaro-primary-hover underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),

      // Code
      code: ({ children, ...props }: HTMLAttributes<HTMLElement>) => {
        const isInline = !children?.toString().includes('\n');

        if (isInline) {
          return (
            <code
              {...props}
              className="px-1.5 py-0.5 rounded bg-takaro-card-hover text-takaro-primary text-sm font-mono"
            >
              {children}
            </code>
          );
        }

        return (
          <div className="mb-3 overflow-x-auto">
            <code
              {...props}
              className="block p-4 rounded bg-takaro-card border border-takaro-border text-sm font-mono text-takaro-text-primary min-w-full whitespace-pre"
            >
              {children}
            </code>
          </div>
        );
      },
      pre: ({ children, ...props }: HTMLAttributes<HTMLPreElement>) => (
        <pre {...props} className="mb-3 rounded">
          {children}
        </pre>
      ),

      // Block quotes
      blockquote: ({
        children,
        ...props
      }: HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
          {...props}
          className="border-l-4 border-takaro-primary pl-4 py-2 mb-3 italic text-takaro-text-secondary bg-takaro-card-hover rounded-r"
        >
          {children}
        </blockquote>
      ),

      // Horizontal rule
      hr: () => <hr className="my-6 border-takaro-border" />,

      // Text formatting
      strong: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
        <strong {...props} className="font-semibold text-takaro-text-primary">
          {children}
        </strong>
      ),
      em: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
        <em {...props} className="italic text-takaro-text-secondary">
          {children}
        </em>
      ),

      // Tables
      table: ({ children, ...props }: HTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto mb-3">
          <table {...props} className="table-takaro w-full">
            {children}
          </table>
        </div>
      ),
      thead: ({
        children,
        ...props
      }: HTMLAttributes<HTMLTableSectionElement>) => (
        <thead {...props} className="bg-takaro-card-hover">
          {children}
        </thead>
      ),
      tbody: ({
        children,
        ...props
      }: HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody {...props}>{children}</tbody>
      ),
      tr: ({ children, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
        <tr {...props} className="border-b border-takaro-border">
          {children}
        </tr>
      ),
      th: ({
        children,
        ...props
      }: HTMLAttributes<HTMLTableHeaderCellElement>) => (
        <th
          {...props}
          className="px-4 py-2 text-left font-medium text-takaro-text-primary"
        >
          {children}
        </th>
      ),
      td: ({
        children,
        ...props
      }: HTMLAttributes<HTMLTableDataCellElement>) => (
        <td {...props} className="px-4 py-2 text-takaro-text-secondary">
          {children}
        </td>
      ),

      // Images (safely handled with Next.js Image)
      img: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
        // Ensure src is a string (react-markdown can pass Blob)
        const imageSrc = typeof src === 'string' ? src : '';

        if (!imageSrc) {
          return null;
        }

        return (
          <div className="relative w-full mb-3">
            <Image
              {...props}
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
