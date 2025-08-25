'use client';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const StyledArticle = styled.div`
    /* latin */
    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Inter Regular'), local('Inter-Regular'),
            url('/inter-regular.woff2') format('woff2'),
            /* Chrome 26+, Opera 23+, Firefox 39+ */ url('/inter-regular.woff')
                format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
    }
    font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans,
        Ubuntu, Cantarell, Helvetica Neue, sans-serif;
`;
const postData = {
    title: 'React Performance Optimization',
    slug: 'https://bvh-data-viewer.vercel.app', // external link (demo/source/etc.)
    excerpt: 'Common performance optimizations and dealing with large datasets',
    date: '2025-08-10',
    readingTime: '6 min',
    coverImage: '/projects/performance.png',
    tags: ['React', 'Performance', 'Big Data'],
    content: `
## Why performance matters

If users have a slow, laggy experience with your product, they won't want to use it. And if you rely heavily on SEO value, Web Vitals are a ranking factor in Google’s search algorithm.

You've probably seen this quote on the lighthouse loading screen:

"Walmart noticed a 1% increase in revenue for every 100 milliseconds of improvement in page load time."

## Common performance optimizations

### Memoization

Memoization is the process of caching a function's output for a given set of parameters.

React hooks that implement this technique can dramatically reduce unnecessary re-renders.
Check out \`useMemo\`, \`useCallback\`, and \`React.memo\`.

The experimental React Compiler tool already implements many of these optimizations by default, so in the future we may not need to write them manually as often.

### Check your dependency arrays

Try to include as few items as possible in your dependency arrays.
For example, avoid putting an entire object in there if you only want to re-render when one of its keys changes.

### Virtualization (windowing large lists)

Packages like **react-window** can help you implement virtualization.

If you render a ton of DOM elements (e.g., a very long list), performance will suffer. Virtualization removes elements that are outside the viewport, replacing them with placeholders. As the user scrolls, the relevant elements are re-inserted into the DOM.

Instagram is a classic example of this technique.

### Lazy loading

You can use \`Suspense\` or \`next/dynamic\` to split JavaScript into its own chunk or load it on demand based on a user action (like a click).

### React Profiler

The React Profiler is a great tool for finding the biggest performance offenders in your app.
With a flamegraph, you can see which components take the longest time to render and optimize accordingly.

### @next/bundle-analyzer

This tool gives you a visual breakdown of the largest items in your bundles.

- You might be importing a third-party package that's much larger than expected.
- Or maybe you imported all of lodash instead of a single utility.

Complex SVGs can also inflate bundle size. If you have a lot of nested shapes, consider referencing the SVG in an \`<img>\` tag instead of embedding it inline.

### Web Workers

If you have intensive data computations to run, Web Workers are very useful. For example, if you have a dataset with thousands of items and need to transform it client-side, a Web Worker can complete the computation without blocking the main thread. This helps keep your UI responsive during CPU-intensive tasks.

### Sampling

Analytics platforms often use sampling to avoid holding massive datasets in memory. Sampling involves taking a subset of a large dataset to create a smaller, representative set that’s faster to process.

### Pagination

Pagination breaks large datasets into smaller pages or chunks. For example, request posts 1-5 first; when the user wants to see more, fetch 6-10 from your API.
`,
} as const;

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    }).format(new Date(iso));
}

export default function BlogPostPage() {
    const {title, slug, excerpt, date, readingTime, coverImage, tags, content} = postData;

    return (
        <StyledArticle className="article">
            <main className="prose mx-auto max-w-3xl px-4 py-10 lg:py-16">
                {/* Header */}
                <header className="mb-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                        <time className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                            {formatDate(date)}
                        </time>
                        <span className="select-none">•</span>
                        <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                            {readingTime} read
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                        {title}
                    </h1>

                    <p className="mt-3 text-zinc-600 dark:text-zinc-300">{excerpt}</p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                                {t}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Cover Image */}
                <figure className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-100 shadow-sm dark:border-zinc-800">
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 768px, 100vw"
                        priority
                    />
                </figure>

                {/* Content */}
                <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-20">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            </main>
        </StyledArticle>
    );
}
