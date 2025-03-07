"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { renderCode } from "../../../../utils/codeFormatter";

interface CollapsibleImplementationProps {
  code: string;
  title?: string;
}

export default function CollapsibleImplementation({
  code,
  title = "Implementation"
}: CollapsibleImplementationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 font-medium mb-2 text-text dark:text-dark-text w-full text-left"
      >
        {isExpanded ? (
          <FiChevronDown className="flex-shrink-0" />
        ) : (
          <FiChevronRight className="flex-shrink-0" />
        )}
        <h4>{title}</h4>
      </button>
      
      {isExpanded && renderCode(code)}
    </div>
  );
}