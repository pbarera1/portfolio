'use client';
import Monitor from '@/components/Monitor';
import Surf from '@/components/Surf';
import styled from 'styled-components';
import RecentHighlights from '@/components/RecentHighlights';

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

export default function Home() {
    return (
        <div className="">
            <StyledMain className="flex flex-col items-center sm:items-start">
                <Monitor />
                <RecentHighlights
                    post={{
                        title: 'How I built a tiny component library',
                        slug: 'tiny-component-library',
                        excerpt: 'Design tokens, Storybook, and ergonomics that scale.',
                        date: '2025-07-10',
                        readingTime: '6 min',
                        coverImage: '/cl.png',
                        tags: ['React', 'Design System'],
                    }}
                    project={{
                        name: 'BVH Data Viewer',
                        slug: 'https://bvh-data-viewer.vercel.app',
                        blurb: 'View select motion capture Biovision Hierarchy datasets from a basketball player.',
                        date: '2025-08-01',
                        stack: ['Three.js', 'React', 'Vite'],
                        coverImage: '/bball.png',
                        liveUrl: 'https://bvh-data-viewer.vercel.app',
                        repoUrl: 'https://github.com/pbarera1/bvh-data-viewer',
                    }}
                />
                <Surf />
            </StyledMain>
            <footer className="row-start-3 flex p-4 flex-wrap items-center justify-center text-stone-900 bg-white">
                Made by Phil Barera © {new Date().getFullYear()}
            </footer>
        </div>
    );
}
