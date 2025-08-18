'use client';
import Monitor from '@/components/Monitor';
import Surf from '@/components/Surf';
import styled from 'styled-components';
import RecentHighlights from '@/components/RecentHighlights';
import {projectData, postData} from '@/app/projects/data';

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
            <footer className="row-start-3 flex p-4 flex-wrap items-center justify-center text-stone-900 bg-white">
                Made by Phil Barera © {new Date().getFullYear()}
            </footer>
        </div>
    );
}
