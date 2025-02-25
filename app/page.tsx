import { getModules } from '../utils/modules';
import Link from 'next/link';

export default function Page() {
  const modules = getModules();

  return (
    <main className="container mx-auto px-4 py-8 bg-background dark:bg-dark-background">
      <h1 className="text-huge font-bold text-center mb-8 text-primary dark:text-dark-primary">
        Community Modules Viewer
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link 
            href={`/module/${module.name}`}
            key={module.name}
          >
            <div className="group bg-placeholder dark:bg-dark-placeholder rounded-large p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <h2 className="text-medium font-bold text-text dark:text-dark-text mb-2">
              {module.name}
            </h2>
            <p className="text-small text-text-alt dark:text-dark-text-alt mb-4">
              {module.description}
            </p>
            <div className="flex justify-between items-center text-tiny">
              <div className="flex items-center gap-2">
                <span className="text-primary dark:text-dark-primary">v{module.version}</span>
                {module.commands && module.commands.length > 0 && (
                  <span className="bg-background-alt dark:bg-dark-background-alt px-2 py-0.5 rounded-small">
                    {module.commands.length} command{module.commands.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-text-alt dark:text-dark-text-alt">by {module.author}</span>
            </div>
            {module.commands && module.commands.length > 0 && (
              <div className="mt-4">
                <h3 className="text-small font-bold text-text dark:text-dark-text mb-2">Commands:</h3>
                <div className="bg-background-alt dark:bg-dark-background-alt rounded-medium p-3 divide-y divide-background/10 dark:divide-dark-background/10">
                  <ul className="space-y-2">
                    {module.commands.slice(0, 3).map((command) => (
                      <li 
                        key={command.trigger} 
                        title={command.helpText}
                        className="group/command flex items-center py-1 hover:bg-background/5 dark:hover:bg-dark-background/5 rounded-small transition-colors"
                      >
                        <span className="font-mono text-primary dark:text-dark-primary">{command.trigger}</span>
                        <span className="ml-2 text-text-alt dark:text-dark-text-alt group-hover/command:text-text dark:group-hover/command:text-dark-text transition-colors">
                          {command.name}
                        </span>
                      </li>
                    ))}
                    {module.commands.length > 3 && (
                      <li className="pt-2 text-center">
                        <span className="text-primary dark:text-dark-primary hover:text-primary-shade dark:hover:text-dark-primary-shade transition-colors cursor-pointer">
                          +{module.commands.length - 3} more commands...
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
