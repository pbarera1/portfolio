'use client';
import Monitor from '@/components/Monitor';
import Surf from '@/components/Surf';
import styled from 'styled-components';
import RecentHighlights from '@/components/RecentHighlights';
import {projectData, postData} from '@/app/projects/data';
import {LogoLinkedin, GithubSolid} from '@/components/Icons';
import Link from 'next/link';
const project = projectData.filter((project) => project.name === 'BVH Data Viewer')?.[0];

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
                <RecentHighlights post={postData} project={project} />
                <Surf />
            </StyledMain>
            <footer className="row-start-3 flex flex-col p-4 flex-wrap items-center justify-center text-stone-900 bg-white gap-2">
                <div>Made by Phil Barera © {new Date().getFullYear()}</div>
                <div className="flex gap-2 text-xl">
                    <Link href="https://www.linkedin.com/in/philbarera/" target="_blank">
                        <LogoLinkedin />
                    </Link>
                    <Link
                        href="https://github.com/pbarera1?tab=repositories"
                        target="_blank">
                        <GithubSolid />
                    </Link>
                </div>
            </footer>
        </div>
    );
}
