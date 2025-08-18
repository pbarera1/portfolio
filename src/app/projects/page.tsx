'use client';
import styled from 'styled-components';
import {Card} from '@/components/RecentHighlights';
import {useParams} from 'next/navigation';
import React, {useEffect, useRef, SetStateAction} from 'react';
import {projectData} from '@/app/projects/data';

type SliderProps = {
    items: React.ReactNode[];
    sideScale?: number;
    gapPx?: number;
    /** externally controlled slide index */
    currentIndex?: number;
    setCurrentIndex?: React.Dispatch<SetStateAction<number>>;
};

const SnapCardSlider = ({
    items,
    sideScale = 0.5,
    gapPx = 32,
    currentIndex,
    setCurrentIndex,
}: SliderProps) => {
    const trackRef = React.useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     // but also automatically scroll when index changes

    //     const slider = trackRef.current;
    //     const handleScroll = throttle(() => {
    //         if (!slider) return;
    //         const slideWidth = slider.offsetWidth;
    //         const newSlide = Math.round(slider.scrollLeft / slideWidth) || 0;
    //         if (newSlide !== currentIndex) {
    //             console.log('new slide change index', newSlide);
    //             setCurrentIndex(newSlide);
    //         }
    //     }, 100);

    //     if (slider) {
    //         slider.addEventListener('scroll', handleScroll);
    //         return () => slider.removeEventListener('scroll', handleScroll);
    //     }
    // }, [currentIndex]);

    // existing scale effect (as before) …
    React.useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const cards = Array.from(track.querySelectorAll<HTMLDivElement>('[data-card]'));
        if (!cards.length) return;

        // (scale logic unchanged, omitted for brevity)
    }, [sideScale]);

    // 🔑 new effect: jump to index whenever currentIndex changes
    useEffect(() => {
        const track = trackRef.current;
        if (!track || currentIndex == null) return;

        const card = track.querySelectorAll<HTMLDivElement>('[data-card]')[currentIndex];
        if (!card) return;

        // Smooth scroll so the chosen card centers
        card.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
    }, [currentIndex]);

    return (
        <div className="relative w-full">
            <div
                ref={trackRef}
                className="
            flex min-h-screen snap-x snap-mandatory overflow-x-auto
            gap-12 px-6 py-8
            scroll-pl-6 scroll-pr-6
            [-webkit-overflow-scrolling:touch]
          "
                style={{
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
                w-[82%] sm:w-[70%]
                aspect-[4/3]
                transform-gpu transition-transform duration-200 ease-out
              "
                        style={{
                            transform: `scale(sideScale)`,
                            opacity: 0.95,
                        }}>
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
function DemoSnapCardSlider() {
    const [index, setIndex] = React.useState(2);

    const items = projectData.map((project, i) => (
        <Card
            key={i}
            label={project.label}
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
    ));

    return (
        <SnapCardSlider
            items={items}
            sideScale={0.9}
            currentIndex={index}
            setCurrentIndex={setIndex}
        />
    );
}

// function Demo() {
//     const [index, setIndex] = React.useState(2); // start at slide 2

//     return (
//       <>
//         <SnapCardSlider items={[...]} sideScale={0.9} currentIndex={index} />
//         <button onClick={() => setIndex((i) => Math.max(i - 1, 0))}>Prev</button>
//         <button onClick={() => setIndex((i) => Math.min(i + 1, 6))}>Next</button>
//       </>
//     );
//   }

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
