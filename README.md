# pushmodal

Make life easier handling dialogs, sheets and drawers for shadcn.

## Installation 

```bash
pnpm add pushmodal
```

> We take for granted that you already have `@radix-ui/react-dialog` installed. If not, install it as well!

## Usage

1. Create a modal

When creating a dialog/sheet/drawer you need to wrap your component with the `<(Dialog|Sheet|Drawer)Content>` component. But skip the `Root` since we do that for you.

```tsx
// file: src/modals/modal-1.tsx
import { DialogContent } from '@/ui/dialog'

export default function Modal1({ foo }: { foo: string }) {
  return (
    <DialogContent>
      Your modal
    </DialogContent>
  )
}
```


2. Initialize your modals

```tsx
// file: src/modals/index.tsx (alias '@/modals')
import Modal1 from './modal-1'
import Modal2 from './modal-2'
import { createPushModal, SheetWrapper } from 'pushmodal'

export const {
  pushModal,
  popModal,
  popAllModals,
  ModalProvider
} = createPushModal({
  modals: {
    Modal1,
    Modal2,
  },
})
```

How we usually structure things

```md
src
├── ...
├── modals
│   ├── modal-1.tsx
│   ├── modal-2.tsx
│   ├── modal-3.tsx
│   ├── modal-4.tsx
│   ├── modal-5.tsx
│   ├── modal-6.tsx
│   └── index.tsx
├── ...
└── ...

```

2. Add the `<ModalProvider />` to your root file.

```ts
import { ModalProvider } from '@/modals' 

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Notice! You should not wrap your children */}
      <ModalProvider />
      {children}
    </>
  )
}
```

3. Use `pushModal`

`pushModal` can have 3 arguments

1. `name` - name of your modal
2. `props` - props for your specific modal, types are infered from your component!

```tsx
import { SheetWrapper } from 'pushmodal'
import { pushModal } from '@/modals' 

export default function RandomComponent() {
  return (
    <div>
      <button onClick={() => {
        pushModal('Modal1', { foo: 'string' })
      }}>
        Open modal
      </button>
    </div>
  )
}
```

4. Closing modals

You can close modals on three different ways

- `popModal()` - will pop the last added modal
- `popModal('Modal1')` - will pop the last added modal with name `Modal1`
- `popAllModals()` - will close all your modals

## Contributors

- [lindesvard](https://github.com/lindesvard)
- [nicholascostadev](https://github.com/nicholascostadev)