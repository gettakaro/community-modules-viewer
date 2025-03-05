"use client";

import { useState, ReactNode } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { IconType } from "react-icons";

interface ExpandableSectionProps {
  title: string;
  icon: IconType;
  itemCount?: number;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export default function ExpandableSection({
  title,
  icon: Icon,
  itemCount,
  children,
  defaultExpanded = true,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-placeholder dark:bg-dark-placeholder rounded-lg p-6 shadow-sm mb-8 border border-background-alt/20 dark:border-dark-background-alt/20">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Icon className="mr-2 h-5 w-5 text-primary dark:text-dark-primary" />
          <h2 className="text-xl font-semibold text-text dark:text-dark-text">
            {title} {itemCount !== undefined && `(${itemCount})`}
          </h2>
        </div>
        {isExpanded ? (
          <FiChevronDown className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
        ) : (
          <FiChevronRight className="h-5 w-5 text-text-alt dark:text-dark-text-alt" />
        )}
      </button>

      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
}