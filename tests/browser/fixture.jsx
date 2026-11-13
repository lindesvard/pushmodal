import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import * as Radix from '@radix-ui/react-dialog';
import { createPushModal, createResponsiveWrapper } from '../../dist/base-ui.mjs';
import { createPushModal as createRadixPushModal } from '../../dist/index.mjs';
import './fixture.css';

// Observe the actual mount commit, before the starting attribute is removed.
window.mounts = [];
const recordedNodes = new WeakSet();
function recordMount(node) {
  if (node && !recordedNodes.has(node)) {
    recordedNodes.add(node);
    window.mounts.push({
      label: node.textContent,
      starting: node.hasAttribute('data-starting-style'),
    });
  }
}

function Content({ label, animation = 'transition', primitive: Primitive = Dialog }) {
  return (
    <Primitive.Portal>
      <Primitive.Backdrop className="backdrop" />
      <Primitive.Popup ref={recordMount} className={`popup ${animation}`}>
        <Primitive.Title>{label}</Primitive.Title>
        <Primitive.Description>Animation regression fixture</Primitive.Description>
        <Primitive.Close>Close</Primitive.Close>
      </Primitive.Popup>
    </Primitive.Portal>
  );
}

const CustomRoot = (props) => <Dialog.Root {...props} />;
const Responsive = createResponsiveWrapper({
  desktop: { Wrapper: Dialog.Root, Content },
  mobile: { Wrapper: CustomRoot, Content },
});
const base = createPushModal({
  modals: {
    Default: Content,
    Custom: { Wrapper: CustomRoot, Component: Content },
    Alert: {
      Wrapper: AlertDialog.Root,
      Component: (props) => <Content {...props} primitive={AlertDialog} />,
    },
    Responsive: { Wrapper: Responsive.Wrapper, Component: Responsive.Content },
  },
});
const custom = createPushModal({ Wrapper: CustomRoot, modals: { Custom: Content } });
const radix = createRadixPushModal({
  modals: {
    Radix: ({ label }) => (
      <Radix.Portal>
        <Radix.Overlay className="backdrop" />
        <Radix.Content className="popup keyframe radix">
          <Radix.Title>{label}</Radix.Title>
          <Radix.Description>Radix regression fixture</Radix.Description>
          <Radix.Close>Close</Radix.Close>
        </Radix.Content>
      </Radix.Portal>
    ),
  },
});
window.api = { base, custom, radix };

function App() {
  const [visible, setVisible] = React.useState(true);
  window.unmountProvider = () => setVisible(false);
  return (
    <>
      <button id="opener" onClick={() => base.pushModal('Default', { label: 'Default' })}>
        Open
      </button>
      {visible && <base.ModalProvider />}
      <custom.ModalProvider />
      <radix.ModalProvider />
    </>
  );
}
const app = <App />;
const strict = new URLSearchParams(location.search).has('strict');
createRoot(document.getElementById('root')).render(strict ? <StrictMode>{app}</StrictMode> : app);
