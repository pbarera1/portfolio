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
If users have a slow, laggy experience with your product they won't want to use it. And if you rely heavily on SEO value, Web Vitals are a ranking factor in Google's search algorithm.

"Walmart noticed a 1% increase in revenue for every 100 milliseconds improvement in page load."

## Common performance optimizations

### Memoization

Memoization is caching a functions output given certain paramters.

React hooks to implement this technique can dramtically reduce re-renders.

Check our useMemo, useCallback and React.memo. The experimental React complier tool implemenets many of this optimization by default, so hopefully pretty soon we won't have to write these very often.

### Check your dependency arrays

Try to include as few items as possible in your dependency arrays. For example, avoid putting an object in there is you only want to rerender when a certain keys changes.

### Virtualization (Windowing large lists)

Packages like react-window can help you implement this concept. If you have a ton of DOM elements (ex. supoer long list) that will hurt performance.

Using virualization allows you to remove the elements that are outside the viewport. You keep a space holder and as you scroll up or down you place the data for the elements back into the DOM.

Instagram is a classic example of this technique.

### Lazyload when possible

You can use Suspense of next/dynamic to split JS into it's own chunk or load it on demand based on a user action like a click.

### React Profiler

This is a great tool for finding the biggest offenders in you app. You can use a flamegraph to see the sorted view of what component is taking the longest time to render.

### @next/bundle-analyzer

This will give you a visual or what the largest items in your bundles are. Maybe you're using a 3rd party package thats much larger than you though. Or maybe you imported all of lodash when you only meant to import a specific utility.

Complex svg's can also add to the bundle size. Once you have alot of nested shapes it might make sense to link to your svg in an img tag, that was you don't bloat js file sizes.

### Webworkers

If you have intensive data computation to do, webworkers could be very useful. Say you have a dataset of 1000s of items and you need to transform is clientside in some way, you can use webworkers to coplete this action without blocking the main thread.

This can help keep your UI responsive during these CPU intense tasks.

### Sampling

Google analytics would use this technqiue to avoid keeping giant datasets in state.

This technique involves taking a subset of a larger dataset to create a smaller representative set.

### Pagination

Another technique to help break up large data sets. You split your data in smaller chunks or pages.

Ex. give me posts 1-5, when the user wants to see more hit your API for 6-10

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
