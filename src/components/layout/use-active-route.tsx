'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function useActiveRoute() {
  const pathname = usePathname();

  return useMemo(() => ({
    isActive: (href: string, exact: boolean) => {
      if (exact) return pathname === href;
      const base = href.split("?")[0];
      return pathname.startsWith(base);
    },
    pathname,
  }), [pathname]);
}
