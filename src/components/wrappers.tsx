import { Dialog, DialogContent } from './dialog';
import { Sheet, SheetContent } from './sheet';

export type DialogWrapperProps = React.ComponentProps<typeof Dialog>;
export function DialogWrapper({ children, ...props }: DialogWrapperProps) {
  return (
    <Dialog {...props}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export type SheetWrapperProps = React.ComponentProps<typeof Dialog>;
export function SheetWrapper({ children, ...props }: SheetWrapperProps) {
  return (
    <Sheet {...props}>
      <SheetContent>{children}</SheetContent>
    </Sheet>
  );
}
