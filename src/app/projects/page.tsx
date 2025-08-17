'use client';
import styled from 'styled-components';
import {Card} from '@/components/RecentHighlights';
import {useParams} from 'next/navigation';
import React, {useEffect, useRef} from 'react';

type SliderProps = {
    items: React.ReactNode[];
    /** how much to scale side cards (0.85 = 85%) */
    sideScale?: number;
    /** horizontal gap between cards, in rem (tailwind gap classes still apply) */
    gapPx?: number;
};

const SnapCardSlider = ({
    items,
    sideScale = 0.5,
    gapPx = 32, // ~gap-6 (6*4px) * 1rem-ish; only used for initial scroll padding
}: SliderProps) => {
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const cards = Array.from(track.querySelectorAll<HTMLDivElement>('[data-card]'));
        if (!cards.length) return;

        let raf = 0;
        const container = track;

        const measureAndStyle = () => {
            const cRect = container.getBoundingClientRect();
            const centerX = cRect.left + cRect.width / 2;

            cards.forEach((el) => {
                const r = el.getBoundingClientRect();
                const cardCenter = r.left + r.width / 2;
                const dist = Math.abs(centerX - cardCenter);

                // normalize distance: 0 at center, 1 ~ at container edge
                const norm = Math.min(dist / (cRect.width / 2), 1);
                const scale = (1 - sideScale) * (1 - norm) + sideScale; // lerp: norm=0 -> 1, norm=1 -> sideScale
                const opacity = 0.85 + 0.15 * (1 - norm); // subtle fade

                el.style.transform = `scale(${scale})`;
                el.style.opacity = String(opacity);
            });
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measureAndStyle);
        };

        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measureAndStyle);
        };

        // initial paint
        measureAndStyle();

        container.addEventListener('scroll', onScroll, {passive: true});
        window.addEventListener('resize', onResize);
        const ro = new ResizeObserver(onResize);
        ro.observe(container);

        return () => {
            cancelAnimationFrame(raf);
            container.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            ro.disconnect();
        };
    }, [sideScale]);

    return (
        <div className="relative w-full">
            {/* Edge fade hints (optional) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

            <div
                ref={trackRef}
                className="
            flex min-h-screen snap-x snap-mandatory overflow-x-auto
            gap-6 px-6 py-8
            scroll-pl-6 scroll-pr-6
            [-webkit-overflow-scrolling:touch]
          "
                style={{
                    // ensure neighbors peek in view on first/last card
                    scrollPaddingLeft: `${gapPx}px`,
                    scrollPaddingRight: `${gapPx}px`,
                }}
                aria-label="Card slider">
                {items.map((node, i) => (
                    <div
                        key={i}
                        data-card
                        className="
                snap-center shrink-0
                w-[82%] sm:w-[70%] md:w-[60%] lg:w-[44%] xl:w-[36%]
                aspect-[4/3]
                bg-white rounded-2xl shadow-xl ring-1 ring-black/10
                transform-gpu transition-transform duration-200 ease-out
              "
                        // start side-scaled; JS will bump center card to 1.0 quickly
                        style={{transform: `scale(${sideScale})`, opacity: 0.95}}>
                        {/* Card content */}
                        <div className="h-full w-full overflow-hidden rounded-2xl">
                            {node}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ---------- Example usage ---------- */
// Tailwind helpers to visualize content cards
function DemoSnapCardSlider() {
    const post = {
        title: 'How I built a tiny component library',
        slug: 'https://bvh-data-viewer.vercel.app',
        excerpt: 'Design tokens, Storybook, and ergonomics that scale.',
        date: '2025-07-10',
        readingTime: '6 min',
        coverImage: '/cl.png',
        tags: ['React', 'Design System'],
    };
    const items = Array.from({length: 7}).map((_, i) => (
        <Card
            key={i}
            label="Latest post"
            title={post.title}
            href={`${post.slug}`}
            date={post.date}
            kicker={post.readingTime}
            image={post.coverImage}
            description={post.excerpt}
            chips={post.tags}
        />
    ));

    return <SnapCardSlider items={items} sideScale={0.9} />;
}

const StyledMain = styled.main`
    // overflow-y: scroll;
    // scroll-snap-type: y mandatory;
    // height: 100vh;
    // > div {
    //     height: 100vh;
    //     scroll-snap-align: center;
    //     scroll-snap-stop: always;
    // }
`;

export default function Projects() {
    const params = useParams<{tag: string; item: string}>();

    return (
        <div className="">
            <StyledMain className="flex flex-col items-center sm:items-start">
                <DemoSnapCardSlider />
            </StyledMain>
            <footer className="row-start-3 flex p-4 flex-wrap items-center justify-center text-stone-900 bg-white">
                Made by Phil Barera © {new Date().getFullYear()}
            </footer>
        </div>
    );
}
