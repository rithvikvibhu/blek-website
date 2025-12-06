import React, { useState, useEffect, useRef } from 'react';

type Action = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  perform: () => void;
};

type Project = {
  slug: string;
  title: string;
};

interface CommandPaletteProps {
  projects?: Project[];
}

export default function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: Action[] = [
    { id: 'home', label: 'Go to Home', perform: () => window.location.href = '/' },
    { id: 'projects', label: 'Go to Projects', perform: () => window.location.href = '/projects' },
    // { id: 'experience', label: 'Go to Experience', perform: () => window.location.href = '/experience' },
    { id: 'stats', label: 'Go to Stats', perform: () => window.location.href = '/stats' },
    { id: 'about', label: 'Go to About', perform: () => window.location.href = '/about' },
    { id: 'links', label: 'Go to Find Me', perform: () => window.location.href = '/links' },
    {
      id: 'copy-email',
      label: 'Copy Email',
      perform: () => {
        navigator.clipboard.writeText('rithvikvibhu@gmail.com');
        alert('Email copied to clipboard!');
        setIsOpen(false);
      }
    },
    ...projects.map(project => ({
      id: `project-${project.slug}`,
      label: `Project: ${project.title}`,
      perform: () => window.location.href = `/projects/${project.slug}`
    })),
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 50);
        setQuery('');
        setActiveIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[activeIndex]) {
        filteredActions[activeIndex].perform();
        if (filteredActions[activeIndex].id !== 'copy-email') {
            // Don't close immediately if it's navigation (browser handles it), but good practice
            setIsOpen(false);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or jump to..."
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-lg"
            value={query}
            onChange={e => {
                setQuery(e.target.value);
                setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-xs text-slate-400 font-mono border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
            ESC
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No results found.</div>
          ) : (
            filteredActions.map((action, index) => (
              <button
                key={action.id}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  index === activeIndex
                    ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onClick={() => {
                    action.perform();
                    setIsOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{action.label}</span>
                {index === activeIndex && (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
                     <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                   </svg>
                )}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400 px-4 flex justify-between">
             <span>Search projects, pages, or actions</span>
             <span className="font-mono">Cmd+K</span>
        </div>
      </div>
    </div>
  );
}

