# pushmodal

Make life easier handling dialogs, sheets and drawers for shadcn.

> this package is not stable yet 🫣 **Breaking change from `0.0.5` -> `0.0.6`**

## Installation 

```bash
pnpm add pushmodal
```

> We take for granted that you already have `@radix-ui/react-dialog` installed. If not ➡️ `pnpm add @radix-ui/react-dialog`

## Usage

#### 1. Create a modal

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


####  2. Initialize your modals

```tsx
// file: src/modals/index.tsx (alias '@/modals')
import ModalExample from './modal-example'
import SheetExample from './sheet-example'
import DrawerExample from './drawer-examle'
import { createPushModal, SheetWrapper } from 'pushmodal'

export const {
  pushModal,
  popModal,
  popAllModals,
  ModalProvider
} = createPushModal({
  modals: {
    // Short hand
    ModalExample,
    SheetExample,

    // Longer definition where you can choose what wrapper you want
    // Only needed if you don't want `Dialog.Root` from '@radix-ui/react-dialog'
    // shadcn drawer needs a custom Wrapper
    DrawerExample: {
      Wrapper: Drawer,
      Component: DrawerExample
    }
  },
})
```

How we usually structure things

```md
src
├── ...
├── modals
│   ├── modal-example.tsx
│   ├── sheet-example.tsx
│   ├── drawer-examle.tsx
│   ├── ... more modals here ...
│   └── index.tsx
├── ...
└── ...
```

#### 3. Add the `<ModalProvider />` to your root file.

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

#### 4. Use `pushModal`

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
        pushModal('ModalExample', { foo: 'string' })
      }}>
        Open modal
      </button>
      <button onClick={() => {
        pushModal('SheetExample')
      }}>
        Open Sheet
      </button>
      <button onClick={() => {
        pushModal('DrawerExample')
      }}>
        Open Drawer
      </button>
    </div>
  )
}
```

#### 4. Closing modals

You can close a modal in three different ways:

- `popModal()` - will pop the last added modal
- `popModal('Modal1')` - will pop the last added modal with name `Modal1`
- `popAllModals()` - will close all your modals

## Contributors

- [lindesvard](https://github.com/lindesvard)
- [nicholascostadev](https://github.com/nicholascostadev)