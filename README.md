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
import Modal1 from './Modal1'
import Modal2 from './Modal2'
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
    },
  },
  // Change default wrapper
  // defaultWrapper: SheetWrapper
})
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

1. `name` - the name of your modal
2. `props` - the props the modal, this options will infer types from your component
3. `options` - options for the modal

```tsx
import { pushModal } from '@/modals' 

export default function RandomComponent() {
  return (
    <div>
      <button onClick={() => {
        pushModal('Modal1', {})
      }}>
        Open modal
      </button>
      
      <button onClick={() => {
        pushModal('Modal1', {}, { Wrapper: })
      }}>
        Open modal
      </button>
    </div>
  )
}
```

4. Closing modals

You can use `popModal` to close modals. Example `popModal('Modal1')`

## Options

> More options will come!

```ts
type PushModalOptions = {
  Wrapper: React.ComponentType<{
    open: boolean
    onOpenChange: (open: boolean) => void
  }>
}
```

## Roadmap

- Add option to enable/disable close on click outside
- Add option to enable/disable press ESC to close

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