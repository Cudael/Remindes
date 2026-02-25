'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PageContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger fade out
    setIsAnimating(true);

    // Wait for fade out, then update content and fade in
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsAnimating(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div
      className="animate-page-fade-in"
      style={{
        opacity: isAnimating ? 0 : undefined,
        transition: isAnimating ? 'opacity 0.15s ease-out' : undefined,
      }}
    >
      {displayChildren}
    </div>
  );
}
