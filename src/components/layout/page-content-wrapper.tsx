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
    // Only re-trigger animation on route change, not on every children re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
