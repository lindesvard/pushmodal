import { ComponentType } from 'react';
import { BaseWrapperProps } from '../components/wrappers';

export type WrapperComponent = ComponentType<BaseWrapperProps>;

export interface PushModalOptions {
  Wrapper?: WrapperComponent;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}
