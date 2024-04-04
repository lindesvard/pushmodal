import { Dialog, DialogContent } from './dialog';
import { Sheet, SheetContent } from './sheet';

export type BaseWrapperProps = React.ComponentProps<typeof Dialog> &
  Pick<
    React.ComponentProps<typeof DialogContent>,
    'onInteractOutside' | 'onPointerDownOutside' | 'onEscapeKeyDown'
  >;

export type DialogWrapperProps = BaseWrapperProps;
export function DialogWrapper({
  children,
  onInteractOutside,
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: DialogWrapperProps) {
  return (
    <Dialog {...props}>
      <DialogContent {...{ onInteractOutside, onPointerDownOutside, onEscapeKeyDown }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export type SheetWrapperProps = BaseWrapperProps;
export function SheetWrapper({
  children,
  onInteractOutside,
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: SheetWrapperProps) {
  return (
    <Sheet {...props}>
      <SheetContent {...{ onInteractOutside, onPointerDownOutside, onEscapeKeyDown }}>
        {children}
      </SheetContent>
    </Sheet>
  );
}
