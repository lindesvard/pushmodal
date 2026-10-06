'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { createPushModal as createPushModalCore, CreatePushModalOptions } from './core';

export type { CreatePushModalOptions, ModalWrapperProps } from './core';

/** Radix UI remains the default for existing consumers. */
export function createPushModal<T>({
  Wrapper = Dialog.Root,
  ...options
}: CreatePushModalOptions<T>) {
  return createPushModalCore({ ...options, Wrapper });
}
