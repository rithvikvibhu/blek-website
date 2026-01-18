import React, { Suspense, useEffect, useState } from "react";
import type { Project, BlogPost } from "./CommandPalette";

const LazyCommandPalette = React.lazy(() => import("./CommandPalette"));

interface CommandPaletteLauncherProps {
  projects?: Project[];
  blogPosts?: BlogPost[];
}

/**
 * Lazily loads the actual command palette only after the user tries to open it.
 * This keeps the palette's bundle off the initial critical path.
 */
export default function CommandPaletteLauncher({
  projects = [],
  blogPosts = [],
}: CommandPaletteLauncherProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenOnLoad(true);
        setShouldLoad(true);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [shouldLoad]);

  // Fallback: load after idle so the palette still becomes available eventually.
  useEffect(() => {
    if (shouldLoad) return;
    const timeout = window.setTimeout(() => setShouldLoad(true), 5000);
    return () => window.clearTimeout(timeout);
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <LazyCommandPalette projects={projects} blogPosts={blogPosts} openOnMount={openOnLoad} />
    </Suspense>
  );
}

