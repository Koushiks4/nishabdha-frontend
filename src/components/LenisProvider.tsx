import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.5,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1.2,
        touchMultiplier: 2,
        infinite: false,
        normalizeWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
