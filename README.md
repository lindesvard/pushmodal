# pushmodal

Make life easier handling dialogs, sheets and drawers for shadcn.

## Installation 

```bash
pnpm add pushmodal
```

## Usage

1. First initialize your modals

```tsx
// file: src/modals/index.tsx (alias '@/modals')
import Modal1 from './modal-1'
import Modal2 from './model-2'
import { createPushModal, SheetWrapper } from 'pushmodal'

export const {
  pushModal,
  popModal,
  ModalProvider
} = createPushModal({
  modals: {
    Modal1: {
      Component: Modal1
    },
    Modal2: {
      Component: Modal2
      // This will appear as a sheet instead of dialog
      Wrapper: SheetWrapper,
      // Options for this modal
      // onEscapeKeyDown(event) {
      //   event.preventDefault();
      // },
      // onInteractOutside(event) {
      //   event.preventDefault();
      // },
      // onPointerDownOutside(event) {
      //   event.preventDefault();
      // },
    },
  },
  // Change default wrapper
  // defaultWrapper: SheetWrapper
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
3. `options` - [options](#options) for the modal

```tsx
import { SheetWrapper } from 'pushmodal'
import { pushModal } from '@/modals' 

export default function RandomComponent() {
  return (
    <div>
      <button onClick={() => {
        pushModal('Modal1')
      }}>
        Open modal
      </button>
      
      <button onClick={() => {
        pushModal('Modal1', {}, { Wrapper: SheetWrapper })
      }}>
        Open modal in sheet instead!
      </button>
     
     <button onClick={() => {
        pushModal('Modal1', {}, { 
          onInteractOutside: (event) => event.preventDefault()
        })
      }}>
        Open modal with custom config
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

## Options

```ts
export interface PushModalOptions {
  Wrapper?: React.ComponentType<{
    open: boolean
    onOpenChange: (open: boolean) => void
  }>
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}
```

### Update options on the fly

It's common to want to update options on the fly. Then you can use `usePushModal` hook. 

```tsx
export default Modal() {
  const [options, setOptions] = usePushModal()
  const someCondition = false

  useEffect(() => {
    if(someCondition) {
      setOptions(prev => ({
        onInteractOutside: (event) => event.preventDefault()
      }))
    }
  }, [])

  return (
    <>
      ...
    </>
  )
}
```

You can also pass options directly to the hook if you want your options to take effect immediately

```tsx
export default Modal() {
  usePushModal({
    onInteractOutside: (event) => event.preventDefault()
  })

  return (
    <>...</>
  )
}
```

## Issues

### No styling?

You might need to add the following to you tailwind.config. Of provide your own [wrapper](src/components/wrappers.tsx) as option for `createPushModal`.

```js
// tailwind.config.js
  ...
  content: [
    './node_modules/pushmodal/**/*.js', // <---
  ],
  ...
```

## Contributors

- [lindesvard](https://github.com/lindesvard)
- [nicholascostadev](https://github.com/nicholascostadev)