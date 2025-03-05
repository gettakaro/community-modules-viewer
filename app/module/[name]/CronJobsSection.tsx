"use client";
import { FiClock } from "react-icons/fi";
import ExpandableSection from "./ExpandableSection";
import CollapsibleImplementation from "./CollapsibleImplementation";

interface CronJobsProps {
  cronJobs: {
    name: string;
    schedule: string;
    function: string;
  }[];
}

export default function CronJobsSection({ cronJobs }: CronJobsProps) {
  return (
    <ExpandableSection
      title="Cron Jobs"
      icon={FiClock}
      itemCount={cronJobs.length}
    >
      <div className="space-y-6">
        {cronJobs.map((cronJob, index) => (
          <div
            key={index}
            className="border-b border-background-alt/20 dark:border-dark-background-alt/20 pb-6 last:border-0"
          >
            <div className="text-xl font-medium mb-1 text-text dark:text-dark-text">
              {cronJob.name}
            </div>
            <div className="font-mono text-sm bg-background-alt dark:bg-dark-background-alt px-2 py-1 rounded-md inline-block mb-3 text-text-alt dark:text-dark-text-alt">
              Schedule: {cronJob.schedule}
            </div>
            
            <CollapsibleImplementation code={cronJob.function} />
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
}