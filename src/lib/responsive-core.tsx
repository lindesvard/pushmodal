'use client';

import { useLayoutEffect, useState } from 'react';
import type { ComponentType } from 'react';

// Infer each component's props, then expose only props accepted by both variants.
// This preserves library-specific props without importing Radix or Base UI types.
interface Options<
  MobileWrapperProps,
  DesktopWrapperProps,
  MobileContentProps,
  DesktopContentProps,
> {
  mobile: {
    Wrapper: ComponentType<MobileWrapperProps>;
    Content: ComponentType<MobileContentProps>;
  };
  desktop: {
    Wrapper: ComponentType<DesktopWrapperProps>;
    Content: ComponentType<DesktopContentProps>;
  };
  breakpoint?: number;
}

export function createResponsiveWrapper<
  MobileWrapperProps extends object,
  DesktopWrapperProps extends object,
  MobileContentProps extends object,
  DesktopContentProps extends object,
>({
  mobile,
  desktop,
  breakpoint = 640,
}: Options<MobileWrapperProps, DesktopWrapperProps, MobileContentProps, DesktopContentProps>) {
  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useLayoutEffect(() => {
      const checkDevice = (event: MediaQueryList | MediaQueryListEvent) => {
        setIsMobile(event.matches);
      };

      // Initial detection
      const mediaQueryList = window.matchMedia(`(max-width: ${breakpoint}px)`);
      checkDevice(mediaQueryList);

      // Listener for media query change
      mediaQueryList.addEventListener('change', checkDevice);

      // Cleanup listener
      return () => {
        mediaQueryList.removeEventListener('change', checkDevice);
      };
    }, []);

    return isMobile;
  }

  function Wrapper(props: MobileWrapperProps & DesktopWrapperProps) {
    const isMobile = useIsMobile();
    return isMobile ? <mobile.Wrapper {...props} /> : <desktop.Wrapper {...props} />;
  }
  function Content(props: MobileContentProps & DesktopContentProps) {
    const isMobile = useIsMobile();
    return isMobile ? <mobile.Content {...props} /> : <desktop.Content {...props} />;
  }

  return {
    Wrapper,
    Content,
  };
}
