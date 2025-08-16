'use client';
import styled from 'styled-components';

const StyledSurf = styled.div`
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    background: linear-gradient(
        74deg,
        rgb(66, 133, 244) 0px,
        rgb(155, 114, 203) 9%,
        rgb(217, 101, 112) 20%,
        rgb(217, 101, 112) 24%,
        rgb(155, 114, 203) 35%,
        rgb(66, 133, 244) 44%,
        rgb(155, 114, 203) 50%,
        rgb(217, 101, 112) 56%,
        rgb(217, 101, 112) 75%,
        rgb(217, 101, 112) 100%
    );

    .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100vh;
        min-height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1;
    }

    .free {
        color: #fff;
        font-family: 'chicago';
        font-size: 44px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    video {
        width: 100%;
        height: 100vh;
        min-height: 100vh;
        object-fit: cover;
    }

    .text {
        font-optical-sizing: auto;
        background: linear-gradient(135deg, #ffffff, rgb(217, 101, 112), #ffffff);
        background-clip: text;
        color: transparent;
        background-size: 200% 100%;
        animation: shimmer 5s linear infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
`;

const Surf = () => {
    return (
        <StyledSurf>
            <div className="video-overlay"></div>
            <div className="free">
                <ul className="flex flex-col gap-6">
                    <li>Subpar Surfer</li>
                    <li>
                        <a
                            style={{color: 'lightblue'}}
                            href="https://athletics.ithaca.edu/news/2011/3/21/MBB_0321110819.aspx?path=mbasket"
                            target="_blank">
                            Decent Basketball Player
                        </a>
                    </li>
                    <li>Excellent Problem Solver</li>
                </ul>
            </div>
            <video
                width="1280"
                height="720"
                preload="none"
                playsInline
                muted
                autoPlay
                loop>
                <source src="/surf.mp4" type="video/mp4" />
            </video>
        </StyledSurf>
    );
};

export default Surf;
