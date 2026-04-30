import { useLenis } from 'lenis/react';

/**
 * Hook to access Lenis smooth scroll instance
 * Use this to programmatically control scrolling
 *
 * @example
 * const scrollTo = useSmoothScroll();
 *
 * // Scroll to top
 * scrollTo(0);
 *
 * // Scroll to element
 * scrollTo('#section-id');
 *
 * // Scroll with options
 * scrollTo(500, { duration: 2, easing: (t) => t });
 */
export function useSmoothScroll() {
  const lenis = useLenis();

  return (
    target: number | string | HTMLElement,
    options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
    }
  ) => {
    lenis?.scrollTo(target, options);
  };
}
