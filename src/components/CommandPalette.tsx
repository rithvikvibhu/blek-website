import React, { useState, useEffect, useRef } from "react";

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
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: Action[] = [
    {
      id: "home",
      label: "Go to Home",
      perform: () => (window.location.href = "/"),
    },
    {
      id: "projects",
      label: "Go to Projects",
      perform: () => (window.location.href = "/projects"),
    },
    // { id: 'experience', label: 'Go to Experience', perform: () => window.location.href = '/experience' },
    {
      id: "stats",
      label: "Go to Stats",
      perform: () => (window.location.href = "/stats"),
    },
    {
      id: "about",
      label: "Go to About",
      perform: () => (window.location.href = "/about"),
    },
    {
      id: "links",
      label: "Go to Find Me",
      perform: () => (window.location.href = "/links"),
    },
    {
      id: "copy-email",
      label: "Copy Email",
      perform: () => {
        navigator.clipboard.writeText("rithvikvibhu@gmail.com");
        alert("Email copied to clipboard!");
        setIsOpen(false);
      },
    },
    ...projects.map((project) => ({
      id: `project-${project.slug}`,
      label: `Project: ${project.title}`,
      perform: () => (window.location.href = `/projects/${project.slug}`),
    })),
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if ("umami" in window) {
          (window as any).umami.track("Command Palette Toggle", {
            action: "close",
            method: "escape",
          });
        }
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + filteredActions.length) % filteredActions.length,
      );
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (query.length > 0) {
        e.stopPropagation();
        setQuery("");
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[activeIndex]) {
        const action = filteredActions[activeIndex];
        // Track action selection via keyboard
        if ("umami" in window) {
          (window as any).umami.track("Command Palette Action", {
            action: action.label,
            id: action.id,
            method: "enter",
          });
        }
        action.perform();
        if (action.id !== "copy-email") {
          // Don't close immediately if it's navigation (browser handles it), but good practice
          setIsOpen(false);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .command-palette-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .command-palette-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .command-palette-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 4px;
        }
        .command-palette-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        .dark .command-palette-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
        }
        .dark .command-palette-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
        .command-palette-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
        .dark .command-palette-scroll {
          scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[20vh]">
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/50"
          onClick={() => {
            setIsOpen(false);
            if ("umami" in window) {
              (window as any).umami.track("Command Palette Toggle", {
                action: "close",
                method: "backdrop",
              });
            }
          }}
        />
        <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5 duration-200 dark:bg-slate-900 dark:ring-white/10">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-slate-400"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or jump to..."
              className="w-full border-none bg-transparent text-lg text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
            <div className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-400 dark:border-slate-700">
              ESC
            </div>
          </div>

          <div className="command-palette-scroll max-h-[60vh] overflow-y-auto p-2">
            {filteredActions.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No results found.
              </div>
            ) : (
              filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                    index === activeIndex
                      ? "text-primary dark:text-primary bg-slate-100 dark:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => {
                    if ("umami" in window) {
                      (window as any).umami.track("Command Palette Action", {
                        action: action.label,
                        id: action.id,
                        method: "click",
                      });
                    }
                    action.perform();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span>{action.label}</span>
                  {index === activeIndex && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-slate-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="flex justify-between border-t border-slate-100 bg-slate-50 p-2 px-4 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
            <span>Search projects, pages, or actions</span>
            <span className="font-mono">Cmd+K</span>
          </div>
        </div>
      </div>
    </>
  );
}
