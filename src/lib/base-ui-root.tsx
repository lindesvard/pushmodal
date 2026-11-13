'use client';

import { useEffect, useState } from 'react';
import type { JSXElementConstructor } from 'react';
import type { ModalWrapperProps } from './core';

/** Give Base UI a closed commit so its starting-style transitions can run. */
export function withBaseUIEnterTransition(Wrapper: JSXElementConstructor<ModalWrapperProps>) {
  return function BaseUIRoot({ open, onOpenChange, children }: ModalWrapperProps) {
    const [mounted, setMounted] = useState(false);

    // Give responsive wrappers time to commit their chosen root before opening it.
    useEffect(() => {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }, []);

    // Gate the rendered prop, not the entry state: a pop before opening stays closed.
    // In particular, do not forward the core's legacy defaultOpen prop.
    return (
      <Wrapper open={mounted && open} onOpenChange={onOpenChange}>
        {children}
      </Wrapper>
    );
  };
}
