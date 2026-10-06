'use client';

import { Dialog } from '@base-ui/react/dialog';
import { createPushModal as createPushModalCore, CreatePushModalOptions } from './lib/core';

export type { CreatePushModalOptions, ModalWrapperProps } from './lib/core';
export { createResponsiveWrapper } from './lib/responsive-core';

/** Base UI default, with no Radix UI runtime or type dependency. */
export function createPushModal<T>({
  Wrapper = Dialog.Root,
  ...options
}: CreatePushModalOptions<T>) {
  return createPushModalCore({ ...options, Wrapper });
}
