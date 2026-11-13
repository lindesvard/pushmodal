'use client';

import { Dialog } from '@base-ui/react/dialog';
import { createPushModal as createPushModalCore, CreatePushModalOptions } from './lib/core';
import { withBaseUIEnterTransition } from './lib/base-ui-root';

export type { CreatePushModalOptions, ModalWrapperProps } from './lib/core';
export { createResponsiveWrapper } from './lib/responsive-core';

/** Base UI default, with no Radix UI runtime or type dependency. */
export function createPushModal<T>({ Wrapper = Dialog.Root, modals }: CreatePushModalOptions<T>) {
  // Adapt overrides as well as the default, once per factory to keep root identity stable.
  const adaptedModals = { ...modals };
  for (const name of Reflect.ownKeys(adaptedModals) as (keyof T)[]) {
    const modal = adaptedModals[name];
    if ('Component' in modal) {
      adaptedModals[name] = {
        Component: modal.Component,
        Wrapper: withBaseUIEnterTransition(modal.Wrapper),
      };
    }
  }

  return createPushModalCore({
    modals: adaptedModals,
    Wrapper: withBaseUIEnterTransition(Wrapper),
  });
}
