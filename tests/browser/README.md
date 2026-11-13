Run the browser regression suite with Node.js 20 or newer:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build-lib
pnpm test:browser
```

The fixture imports the built package entry points and uses the locked Base UI version. CI runs it with React 18.2.0 and 19.2.8. Chromium checks the starting attribute at popup mount and real CSS transitions or keyframe animations through `Element.getAnimations()`. Both normal rendering and Strict Mode cover default, custom, alert, and mobile responsive roots, replacement, cancellation, dismissal, focus restoration, stacking, provider unmount, and Radix compatibility.
