"use client";

import { FiCode } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import { renderCode } from "../../../../utils/codeFormatter";
import CollapsibleImplementation from "./CollapsibleImplementation";

interface FunctionsProps {
  functions: {
    name: string;
    function: string;
  }[];
}

export default function FunctionsSection({ functions }: FunctionsProps) {
  return (
    <ExpandableSection 
      title="Functions" 
      icon={FiCode} 
      itemCount={functions.length}
    >
      <div className="space-y-6">
        {functions.map((func, index) => (
          <div
            key={index}
            className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0"
          >
            <div className="text-xl font-medium mb-3 text-text dark:text-dark-text">
              {func.name}
            </div>
            <CollapsibleImplementation code={func.function} />
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}