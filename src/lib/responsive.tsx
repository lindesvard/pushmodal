'use client';

import type { DialogContentProps, DialogProps } from '@radix-ui/react-dialog';
import { createResponsiveWrapper as createResponsiveWrapperCore } from './responsive-core';

type WrapperProps = DialogProps;
type ContentProps = Omit<DialogContentProps, 'onAnimationEnd'> & {
  onAnimationEnd?: (...args: any[]) => void;
};
type Options = {
  mobile: {
    Wrapper: React.ComponentType<WrapperProps>;
    Content: React.ComponentType<ContentProps>;
  };
  desktop: {
    Wrapper: React.ComponentType<WrapperProps>;
    Content: React.ComponentType<ContentProps>;
  };
  breakpoint?: number;
};

// Keep the original Radix API, including its permissive animation callback.
export function createResponsiveWrapper(options: Options) {
  return createResponsiveWrapperCore<WrapperProps, WrapperProps, ContentProps, ContentProps>(
    options
  );
}
