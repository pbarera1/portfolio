// components/RecentHighlights.tsx
import Link from 'next/link';
import Image from 'next/image';

export type Post = {
    title: string;
    slug: string;
    excerpt?: string;
    date: string; // ISO date
    readingTime?: string; // e.g. "6 min"
    coverImage?: string; // /images/post.jpg
    tags?: string[];
};

export type Project = {
    name: string;
    slug: string;
    blurb?: string;
    date: string; // ISO date (launched/updated)
    stack?: string[];
    coverImage?: string; // /images/project.jpg
    repoUrl?: string;
    liveUrl?: string;
};

export default function RecentHighlights({
    post,
    project,
}: {
    post: Post;
    project: Project;
}) {
    return (
        <section
            aria-labelledby="recent-heading"
            className="relative isolate min-h-screen flex justify-center items-center w-full">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <h2
                        id="recent-heading"
                        className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        The Latest
                    </h2>
                    {/* <div className="flex items-center gap-2">
                        <Link
                            href="/blog"
                            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-4 hover:underline">
                            All posts
                        </Link>
                        <span aria-hidden className="text-zinc-400">
                            ·
                        </span>
                        <Link
                            href="/projects"
                            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline-offset-4 hover:underline">
                            All projects
                        </Link>
                    </div> */}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Latest Post */}
                    <Card
                        label="Latest post"
                        title={post.title}
                        href={`${post.slug}`}
                        date={post.date}
                        kicker={post.readingTime}
                        image={post.coverImage}
                        description={post.excerpt}
                        chips={post.tags}
                    />

                    {/* Latest Project */}
                    <Card
                        label="Latest project"
                        title={project.name}
                        href={`${project.slug}`}
                        date={project.date}
                        kicker={project.stack?.join(' · ')}
                        image={project.coverImage}
                        description={project.blurb}
                        secondaryLinks={
                            [
                                project.liveUrl && {label: 'Live', href: project.liveUrl},
                                project.repoUrl && {label: 'Repo', href: project.repoUrl},
                            ].filter(Boolean) as {label: string; href: string}[]
                        }
                    />
                </div>
            </div>
        </section>
    );
}

export function Card({
    label,
    title,
    href,
    date,
    kicker,
    image,
    description,
    chips,
    secondaryLinks,
}: {
    label: string;
    title: string;
    href: string;
    date: string;
    kicker?: string;
    image?: string;
    description?: string;
    chips?: string[];
    secondaryLinks?: {label: string; href: string}[];
}) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            {/* Media */}
            <Link href={href} className="block">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {image ? (
                        <Image
                            // width={549}
                            // height={475}
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-[1.02]"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            priority={false}
                        />
                    ) : (
                        <div className="absolute inset-0 grid place-items-center text-4xl">
                            🗂️
                        </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-800 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/80 dark:text-zinc-200 dark:ring-zinc-700">
                        {label}
                    </span>
                </div>
            </Link>

            {/* Body */}
            <div className="p-5 sm:p-6">
                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <time dateTime={date}>
                        {new Date(date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </time>
                    {kicker && (
                        <>
                            <span aria-hidden>•</span>
                            <span>{kicker}</span>
                        </>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    <Link href={href} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden />
                        {title}
                    </Link>
                </h3>

                {description && (
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                        {description}
                    </p>
                )}

                {chips && chips.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {chips.slice(0, 4).map((t) => (
                            <li
                                key={t}
                                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                {t}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-4 flex items-center gap-3">
                    <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                        View
                        <span aria-hidden className="translate-y-px">
                            ↗
                        </span>
                    </Link>

                    {secondaryLinks?.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
                            target={l.href.startsWith('http') ? '_blank' : undefined}
                            rel={l.href.startsWith('http') ? 'noreferrer' : undefined}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
}
