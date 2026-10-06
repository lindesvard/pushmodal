![hero](github.png)
<br />
<br />

## Installation 

```bash
pnpm add pushmodal
```

Choose the entry point that matches your dialog components:

| Import              | Default wrapper                         | UI dependency to install    |
| ------------------- | --------------------------------------- | --------------------------- |
| `pushmodal`         | Radix `Dialog.Root` (existing behavior) | `@radix-ui/react-dialog`    |
| `pushmodal/base-ui` | Base UI `Dialog.Root`                   | `@base-ui/react`            |
| `pushmodal/core`    | Your explicit `Wrapper`                 | Your wrapper's dependencies |

Radix remains a required peer to preserve existing installation behavior. Base UI
is an optional peer: install it when you use `pushmodal/base-ui`. Base UI and core
entry points do not load Radix at runtime or in their TypeScript declarations,
even if your package manager installs the Radix peer.

### Base UI / shadcn Base UI

```sh
pnpm add pushmodal @base-ui/react
```

Keep using your Base UI-backed shadcn `DialogContent` or `SheetContent` in the modal,
without its root. Change the factory import:

```tsx
import { createPushModal } from 'pushmodal/base-ui';
import { DialogContent, DialogTitle } from '@/ui/dialog'; // shadcn Base UI dialog

function EditProfile({ userId }: { userId: string }) {
  return (
    <DialogContent>
      <DialogTitle>Edit profile</DialogTitle>
      Editing {userId}
    </DialogContent>
  );
}

export const { ModalProvider, pushModal, popModal } = createPushModal({
  modals: { EditProfile },
});

// Mount <ModalProvider /> once, then open from anywhere:
pushModal('EditProfile', { userId: '123' });
```

For unstyled Base UI, the modal should render `Dialog.Portal`, `Dialog.Backdrop`,
`Dialog.Popup`, and the title/description/close parts instead of shadcn's content.
Use `@base-ui/react/dialog` for these parts. The factory supplies `Dialog.Root` and
controls `open` and `onOpenChange`; Base UI's Close button and Escape dismissal
update the same modal stack as `popModal`.

### Choosing a default wrapper

Set `Wrapper` once for all shorthand modals. A per-modal `Wrapper` overrides it,
so dialogs and drawers can coexist. Use the core entry point to supply your own
root without loading either dialog library:

```tsx
import { createPushModal } from 'pushmodal/core';
import { Dialog } from '@/ui/dialog';
import { Drawer } from '@/ui/drawer';
import EditProfile from './edit-profile';
import MobileSettings from './mobile-settings';

export const { ModalProvider, pushModal } = createPushModal({
  Wrapper: Dialog,
  modals: {
    EditProfile,
    MobileSettings: { Wrapper: Drawer, Component: MobileSettings },
  },
});
```

`Wrapper` is required by `pushmodal/core` and optional in the other entry points.
It must accept `open: boolean`, `onOpenChange: (open?: boolean) => void`, and
`children: React.ReactNode`. Roots receive controlled `open` and the legacy
`defaultOpen` prop. Wrap the root in your own component to configure options such as `modal` or to handle Base UI's
additional change-event details. Pair each modal's content with the matching
wrapper library.

The existing Radix setup below continues to work unchanged.

## Usage

#### 1. Create a modal

When creating a dialog/sheet/drawer you need to wrap your component with the `<(Dialog|Sheet|Drawer)Content>` component. But skip the `Root` since we do that for you.

```tsx
// file: src/modals/modal-example.tsx
import { DialogContent } from '@/ui/dialog' // shadcn dialog

// or any of the below
// import { SheetContent } from '@/ui/sheet' // shadcn sheet
// import { DrawerContent } from '@/ui/drawer' // shadcn drawer

export default function ModalExample({ foo }: { foo: string }) {
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
import { createPushModal } from 'pushmodal'
import { Drawer } from '@/ui/drawer' // shadcn drawer

export const {
  pushModal,
  popModal,
  popAllModals,
  replaceWithModal,
  useOnPushModal,
  onPushModal,
  ModalProvider
} = createPushModal({
  modals: {
    // Short hand
    ModalExample,
    SheetExample,

    // Longer definition where you can choose what wrapper you want
    // Only needed to override the default Wrapper for this modal
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

`pushModal` can have 1-2 arguments

1. `name` - name of your modal 
2. `props` (might be optional) - props for your modal, types are infered from your component!

```tsx
import { pushModal } from '@/modals' 

export default function RandomComponent() {
  return (
    <div>
      <button onClick={() =>  pushModal('ModalExample', { foo: 'string' })}>
        Open modal
      </button>
      <button onClick={() => pushModal('SheetExample')}>
        Open Sheet
      </button>
      <button onClick={() => pushModal('DrawerExample')}>
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

#### 5. Replacing current modal

Replace the last pushed modal. Same interface as `pushModal`.

```ts
replaceWithModal('SheetExample', { /* Props if any */ })
```

#### 6. Using events

You can listen to events with `useOnPushModal` (inside react component) or `onPushModal` (or globally).

The event receive the state of the modal (open/closed), the modals name and props. You can listen to all modal changes with `*` or provide a name of the modal you want to listen on.

**Inside a component**

```tsx
import { useCallback } from 'react'
import { useOnPushModal } from '@/modals'

// file: a-react-component.tsx
export default function ReactComponent() {
  // listen to any modal open/close
  useOnPushModal('*', 
    useCallback((open, props, name) => {
      console.log('is open?', open);
      console.log('props from component', props);
      console.log('name', name);
    }, [])
  )
  
  // listen to `ModalExample` open/close
  useOnPushModal('ModalExample', 
    useCallback((open, props) => {
      console.log('is `ModalExample` open?', open);
      console.log('props for ModalExample', props);
    }, [])
  )
}
```

**Globally**

```ts
import { onPushModal } from '@/modals'

const unsub = onPushModal('*', (open, props, name) => {
  // do stuff
})
```

#### Responsive rendering (mobile/desktop)

`createResponsiveWrapper` from `pushmodal` retains its original Radix props.
The Base UI and core entry points infer root and content props from your
components and accept Base UI, Radix, or custom components. Their returned
components accept props supported by both variants;
for example, use a string `className` when pairing Base UI with a Vaul drawer.
Import this helper from `pushmodal/base-ui` or `pushmodal/core` in a Base UI app
to avoid loading Radix. The wrapper and content for each variant must use the
same library.

In some cases you want to show a drawer on mobile and a dialog on desktop. This is possible and we have created a helper function to get you going faster. `createResponsiveWrapper` 💪 

```tsx
// path: src/modals/dynamic.tsx
import { createResponsiveWrapper } from 'pushmodal'
import { Dialog, DialogContent } from '@/ui/dialog'; // shadcn dialog
import { Drawer, DrawerContent } from '@/ui/drawer'; // shadcn drawer

export default createResponsiveWrapper({
  desktop: {
    Wrapper: Dialog,
    Content: DialogContent,
  },
  mobile: {
    Wrapper: Drawer,
    Content: DrawerContent,
  },
  breakpoint: 640,
});

// path: src/modals/your-modal.tsx
import * as Dynamic from './dynamic'

export default function YourModal() {
  return (
    <Dynamic.Content>
      Drawer in mobile and dialog on desktop 🤘
    </Dynamic.Content>
  )
}

// path: src/modals/index.ts
import * as Dynamic from './dynamic'
import YourModal from './your-modal'
import { createPushModal } from 'pushmodal'

export const {
  pushModal,
  popModal,
  popAllModals,
  replaceWithModal,
  useOnPushModal,
  onPushModal,
  ModalProvider
} = createPushModal({
  modals: {
    YourModal: {
      Wrapper: Dynamic.Wrapper,
      Component: YourModal
    }
  },
})
```

## Issues / Limitations

Issues or limitations will be listed here.

## Contributors

- [lindesvard](https://github.com/lindesvard)
- [nicholascostadev](https://github.com/nicholascostadev)