## Why performance matters

If users have a slow, laggy experience with your product, they won't want to use it. And if you rely heavily on SEO value, Web Vitals are a ranking factor in Google’s search algorithm.

Walmart noticed a 1% increase in revenue for every 100 milliseconds of improvement in page load time.

## Common performance optimizations

### Memoization

Memoization is the process of caching a function's output for a given set of parameters.

React hooks that implement this technique can dramatically reduce unnecessary re-renders.
Check out `useMemo`, `useCallback`, and `React.memo`.

The experimental React Compiler tool already implements many of these optimizations by default, so in the future we may not need to write them manually as often.

### Check your dependency arrays

Try to include as few items as possible in your dependency arrays.
For example, avoid putting an entire object in there if you only want to re-render when one of its keys changes.

### Virtualization (windowing large lists)

Packages like **react-window** can help you implement virtualization.

If you render a ton of DOM elements (e.g., a very long list), performance will suffer. Virtualization removes elements that are outside the viewport, replacing them with placeholders. As the user scrolls, the relevant elements are re-inserted into the DOM.

Instagram is a classic example of this technique.

### Lazy loading

You can use `Suspense` or `next/dynamic` to split JavaScript into its own chunk or load it on demand based on a user action (like a click).

### React Profiler

The React Profiler is a great tool for finding the biggest performance offenders in your app.
With a flamegraph, you can see which components take the longest time to render and optimize accordingly.

### @next/bundle-analyzer

This tool gives you a visual breakdown of the largest items in your bundles.

- You might be importing a third-party package that's much larger than expected.
- Or maybe you imported **all of lodash** instead of a single utility.

Complex SVGs can also inflate bundle size. If you have a lot of nested shapes, consider referencing the SVG in an `
