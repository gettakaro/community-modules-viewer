'use client';

import { useState, useEffect } from 'react';
import { getModules } from '../utils/modules';
import Link from 'next/link';
import { FiPackage, FiCommand, FiMessageSquare, FiClock, FiArrowRight, FiCode, FiGrid, FiList } from 'react-icons/fi';

export default function LandingPage() {
  const [moduleCount, setModuleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  
  useEffect(() => {
    async function fetchModuleCount() {
      try {
        const modulesData = await getModules();
        setModuleCount(modulesData.length);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchModuleCount();
  }, []);
  
  const features = [
    {
      icon: <FiCommand className="w-8 h-8" />,
      title: "Commands",
      description: "Add custom slash commands that players can use to interact with your server"
    },
    {
      icon: <FiMessageSquare className="w-8 h-8" />,
      title: "Hooks",
      description: "Create event-driven actions that respond automatically to in-game events"
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Cron Jobs",
      description: "Schedule automated tasks to run at specific times or intervals"
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Functions",
      description: "Reusable code components to build complex, customized functionality"
    }
  ];

  return (
    <main className="min-h-screen bg-background dark:bg-dark-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-bold text-text dark:text-dark-text mb-6">
            Takaro <span className="text-primary dark:text-dark-primary">Modules</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-alt dark:text-dark-text-alt max-w-3xl mx-auto mb-8">
            Enhance your game servers with powerful, customizable modules for better community management
          </p>
          
          <div className="flex justify-center">
            <Link 
              href="/module" 
              className="bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 text-white px-8 py-3 rounded-lg font-medium text-lg inline-flex items-center transition-colors"
            >
              Browse Modules
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* What are Modules? */}
        <div className="bg-placeholder dark:bg-dark-placeholder rounded-xl p-8 shadow-lg mx-auto max-w-4xl mb-16 border border-background-alt/20 dark:border-dark-background-alt/20">
          <h2 className="text-3xl font-bold text-text dark:text-dark-text mb-4">What are Takaro Modules?</h2>
          <p className="text-lg text-text-alt dark:text-dark-text-alt mb-6">
            Modules are the core of Takaro's functionality, providing a flexible way to add features and customize your game servers. 
            Each module can contain commands, event hooks, scheduled tasks, and more.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 text-text dark:text-dark-text">Built-in Modules</h3>
              <p className="text-text-alt dark:text-dark-text-alt">
                Takaro comes with ready-to-use modules to jumpstart your server. These range from economy systems to teleport utilities, all configurable to your needs.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 text-text dark:text-dark-text">Custom Modules</h3>
              <p className="text-text-alt dark:text-dark-text-alt">
                Create your own modules with custom logic for unique gameplay experiences. Build modules with the Takaro API and JavaScript to extend functionality beyond the built-in options.
              </p>
            </div>
          </div>
        </div>
        
        {/* Module Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text dark:text-dark-text text-center mb-12">
            Module <span className="text-primary dark:text-dark-primary">Components</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-placeholder dark:bg-dark-placeholder rounded-xl p-6 shadow-md border border-background-alt/20 dark:border-dark-background-alt/20 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-primary dark:text-dark-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-alt dark:text-dark-text-alt">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* How It Works */}
        <div className="bg-primary/10 dark:bg-dark-primary/10 rounded-xl p-10 max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-text dark:text-dark-text mb-6">How Modules Work</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary dark:bg-dark-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
              <div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">Browse and Install</h3>
                <p className="text-text-alt dark:text-dark-text-alt">
                  Select from the module library and install them directly to your game servers with just a few clicks.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary dark:bg-dark-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
              <div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">Configure Settings</h3>
                <p className="text-text-alt dark:text-dark-text-alt">
                  Customize module behavior with user-friendly configuration options to match your community's needs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary dark:bg-dark-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
              <div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">Assign Permissions</h3>
                <p className="text-text-alt dark:text-dark-text-alt">
                  Control who can use each module feature by assigning permissions to different player roles.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary dark:bg-dark-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">4</div>
              <div>
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">Enjoy Enhanced Gameplay</h3>
                <p className="text-text-alt dark:text-dark-text-alt">
                  Your players immediately benefit from new features and improved server functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-text dark:text-dark-text mb-4">
            Ready to enhance your game servers?
          </h2>
          <p className="text-lg text-text-alt dark:text-dark-text-alt mb-6 max-w-2xl mx-auto">
            Browse our collection of modules and find the perfect additions to improve your players' experience.
          </p>
          <Link 
            href="/module" 
            className="bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors"
          >
            Explore All Modules
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}