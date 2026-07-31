import { useEffect } from 'react';

export function useTenantTheme(primaryColor: string, secondaryColor: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--secondary', secondaryColor);
    }
  }, [primaryColor, secondaryColor]);
}
