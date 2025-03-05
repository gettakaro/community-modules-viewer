"use client";
import { FiMessageSquare } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import CollapsibleImplementation from "./CollapsibleImplementation";

interface HooksProps {
  hooks: {
    name: string;
    eventType: string;
    function: string;
  }[];
}

export default function HooksSection({ hooks }: HooksProps) {
  return (
    <ExpandableSection
      title="Hooks"
      icon={FiMessageSquare}
      itemCount={hooks.length}
    >
      <div className="space-y-6">
        {hooks.map((hook, index) => (
          <div
            key={index}
            className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xl font-medium text-text dark:text-dark-text">
                {hook.name}
              </div>
              <span className="bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary px-2 py-0.5 rounded text-sm">
                {hook.eventType}
              </span>
            </div>
            
            <CollapsibleImplementation code={hook.function} />
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}