'use client';
import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {gsap} from 'gsap';
import {Draggable} from 'gsap/Draggable';
gsap.registerPlugin(Draggable);
/**
 * classNameic 1986 Mac-style modal
 * Props:
 *  - open: boolean
 *  - title?: string
 *  - onClose: () => void
 *  - children: ReactNode
 *  - actions?: ReactNode  // custom footer actions; defaults to OK/Cancel
 */

const StyledClassicModal = styled.div`
    max-height: 100vh;
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 99;
    padding: 24px;
    font-family: 'chicago';

    .window {
        width: 90vw;
        height: 70vh;
        max-width: 95vw;
        max-height: 80vh;
        background: #fff;
        border: 1px solid #000;
        box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
        resize: both;
        overflow: hidden;
        will-change: transform;
    }
    @media screen and (min-width: 768px) {
        .window {
            height: 500px;
            width: 700px;
            max-width: 1000px;
            max-height: 1000px;
        }
    }

    .window-titlebar {
        border-top: 4px solid #d8d8d8;
        border-bottom: 4px solid #d8d8d8;
        background: repeating-linear-gradient(180deg, #000 0px 1px, #d8d8d8 1px 3px);
        color: white;
        padding: 0 5px;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        position: relative;
    }

    .window-title {
        text-align: center;
        flex-grow: 1;
        background: #ffffff;
        color: black;
        padding: 0 5px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .window-titlebar.inactive .window-title {
        background: #ffffff;
    }

    .window-close {
        width: 19px;
        height: 19px;
        border: 1px solid #000;
        background: #fff;
        cursor: pointer;
        position: relative;
    }

    .window-close:active {
        background: #000;
    }

    .window-content {
        padding: 10px;
        overflow: auto;
        height: calc(100% - 24px); //@todo
        position: relative;
        font-family: 'chicago', sans-serif; /* Ensure text uses Arial */
    }

    .window-content img {
        max-width: 100%; /* Ensure images resize to the current width of the page */
        height: auto;
        width: 100%;
    }

    .window-content::-webkit-scrollbar-button:vertical:increment {
        display: none;
    }

    .window-resizer {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 14px;
        height: 14px;
        background: #dedede;
        border: 1px solid #000;
        box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #bcbcbc;
        cursor: se-resize;
        z-index: 1;
    }

    .window.resizable::after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 14px;
        height: 14px;
        background: #c0c0c0;
        border: 1px solid #000;
        cursor: se-resize;
    }

    @media (max-width: 768px) {
        // .window {
        //     width: calc(100% - 20px) !important; /* Add 10px padding on each side */
        //     height: calc(100% - 30px) !important; /* Adjusted for top bar + padding */
        //     top: 25px !important; /* Slightly more space from the top */
        //     left: 10px !important; /* Add left padding */
        //     resize: none;
        //     max-width: 500px; /* Prevent windows from getting too wide */
        //     margin: 0 auto; /* Center the window if screen is wider than max-width */
        // }

        // /* Make sure content fits nicely */
        // .window-content {
        //     padding: 8px;
        //     font-size: 14px; /* Slightly smaller text on mobile */
        // }
    }

    .window-content::-webkit-scrollbar {
        width: 16px;
    }

    .window-content::-webkit-scrollbar-button:end {
        display: block;
        width: 16px;
        height: 16px;
        background-color: #dedede;
        box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #bcbcbc;
    }

    .window-content::-webkit-scrollbar-button:end:vertical {
        border-left: 1px solid #000;
        border-right: 1px solid #000;
        border-bottom: 1px solid #000;
    }

    .window-content::-webkit-scrollbar-button:end:vertical:decrement {
        background: linear-gradient(transparent 75%, #000 0) 50%/8px 4px no-repeat,
            linear-gradient(transparent 50%, #000 0) 50%/6px 4px no-repeat,
            linear-gradient(transparent 25%, #000 0) 50%/4px 4px no-repeat,
            linear-gradient(#000 50%, #000 0) 50%/2px 4px no-repeat, #dedede;
    }

    .window-content::-webkit-scrollbar-button:end:vertical:increment {
        background: linear-gradient(0deg, transparent 75%, #000 0) 50%/8px 4px no-repeat,
            linear-gradient(0deg, transparent 50%, #000 0) 50%/6px 4px no-repeat,
            linear-gradient(0deg, transparent 25%, #000 0) 50%/4px 4px no-repeat,
            linear-gradient(0deg, #000 50%, #000 0) 50%/2px 4px no-repeat, #dedede;
        height: 15px;
        border-bottom: none;
    }

    .window-content::-webkit-scrollbar-button:end:horizontal {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        border-right: 1px solid #000;
    }

    .window-content::-webkit-scrollbar-button:end:horizontal:decrement {
        background: linear-gradient(90deg, transparent 75%, #000 0) 50%/4px 8px no-repeat,
            linear-gradient(90deg, transparent 50%, #000 0) 50%/4px 6px no-repeat,
            linear-gradient(90deg, transparent 25%, #000 0) 50%/4px 4px no-repeat,
            linear-gradient(90deg, #000 50%, #000 0) 50%/4px 2px no-repeat, #dedede;
    }

    .window-content::-webkit-scrollbar-button:end:horizontal:increment {
        background: linear-gradient(270deg, transparent 75%, #000 0) 50%/4px 8px no-repeat,
            linear-gradient(270deg, transparent 50%, #000 0) 50%/4px 6px no-repeat,
            linear-gradient(270deg, transparent 25%, #000 0) 50%/4px 4px no-repeat,
            linear-gradient(270deg, #000 50%, #000 0) 50%/4px 2px no-repeat, #dedede;
        width: 15px;
        border-right: none;
    }

    .window-content::-webkit-scrollbar-track {
        background-color: #aaaaab;
        border: 1px solid #000;
    }

    .window-content::-webkit-scrollbar-track:vertical {
        box-shadow: inset 1px 1px 0 #787877, inset -1px 2px 0 #cdcccd,
            inset 2px 0 0 #888889, inset -2px 0 0 #bcbcbc;
    }

    .window-content::-webkit-scrollbar-track:horizontal {
        box-shadow: inset 1px 1px 0 #787877, inset 2px -1px 0 #cdcccd,
            inset 0 2px 0 #888889, inset 0 -2px 0 #bcbcbc;
    }

    .window-content::-webkit-scrollbar-thumb {
        box-shadow: inset 1px 1px 0 #cdcdfc, inset -1px -1px 0 #6867c6;
        width: 14px;
        border: 1px solid #000;
    }

    .window-content::-webkit-scrollbar-thumb:vertical {
        background: linear-gradient(
                    transparent 12.5%,
                    #353594 0,
                    #353594 25%,
                    transparent 0,
                    transparent 37.5%,
                    #353594 0,
                    #353594 50%,
                    transparent 0,
                    transparent 62.5%,
                    #353594 0,
                    #353594 75%,
                    transparent 0,
                    transparent 87.5%,
                    #353594 0
                )
                50%/7px 8px no-repeat,
            linear-gradient(
                    #cdcdfc 12.5%,
                    transparent 0,
                    transparent 25%,
                    #cdcdfc 0,
                    #cdcdfc 37.5%,
                    transparent 0,
                    transparent 50%,
                    #cdcdfc 0,
                    #cdcdfc 62.5%,
                    transparent 0,
                    transparent 75%,
                    #cdcdfc 0,
                    #cdcdfc 87.5%,
                    transparent 0
                )
                49%/7px 8px no-repeat,
            #9b9bf9;
    }

    .window-content::-webkit-scrollbar-thumb:horizontal {
        background: linear-gradient(
                    90deg,
                    transparent 12.5%,
                    #353594 0,
                    #353594 25%,
                    transparent 0,
                    transparent 37.5%,
                    #353594 0,
                    #353594 50%,
                    transparent 0,
                    transparent 62.5%,
                    #353594 0,
                    #353594 75%,
                    transparent 0,
                    transparent 87.5%,
                    #353594 0
                )
                50%/8px 7px no-repeat,
            linear-gradient(
                    90deg,
                    #cdcdfc 12.5%,
                    transparent 0,
                    transparent 25%,
                    #cdcdfc 0,
                    #cdcdfc 37.5%,
                    transparent 0,
                    transparent 50%,
                    #cdcdfc 0,
                    #cdcdfc 62.5%,
                    transparent 0,
                    transparent 75%,
                    #cdcdfc 0,
                    #cdcdfc 87.5%,
                    transparent 0
                )
                center 49%/8px 7px no-repeat,
            #9b9bf9;
    }

    .window-content::-webkit-scrollbar-corner {
        border-top: 1px solid #000;
        border-left: 1px solid #000;
        box-shadow: inset 1px 1px 0 #fff;
        background: #cdcccd;
    }
`;

type ChildType = React.ReactNode | undefined;
interface ClassicModalProps {
    open: boolean;
    title: string | undefined;
    onClose?: () => void;
    children?: ChildType;
}
export default function ClassicModal({
    open,
    title = 'File',
    onClose,
    children,
}: ClassicModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);
    const titlebarRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<Draggable | null>(null);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // Create/kill Draggable when modal opens/closes
    useEffect(() => {
        if (!open) return;

        const overlay = overlayRef.current;
        const winEl = windowRef.current;
        if (!overlay || !winEl) return;

        // (Re)create
        const instance = Draggable.create(winEl, {
            bounds: overlay,
            type: 'x,y',
            inertia: false,
            // If you only want to drag from the title bar, uncomment:
            // trigger: titlebarRef.current,
            onPress() {
                gsap.set(this.target, {zIndex: 1, cursor: 'grabbing'});
            },
            onRelease() {
                gsap.set(this.target, {cursor: 'grab', zIndex: 'auto'});
            },
            onDragEnd() {
                const grid = 12; // snap-to-grid (optional)
                const x = Math.round(this.x / grid) * grid;
                const y = Math.round(this.y / grid) * grid;
                gsap.to(this.target, {duration: 0.1, x, y});
                gsap.set(this.target, {zIndex: 0});
            },
        })[0];

        draggableRef.current = instance;

        return () => {
            draggableRef.current?.kill();
            draggableRef.current = null;
        };
    }, [open]);

    if (!open) return null;

    return (
        <StyledClassicModal
            className="overlay"
            ref={overlayRef}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target === e.currentTarget) onClose?.();
            }}>
            <div
                ref={windowRef}
                className="window"
                style={{
                    position: 'absolute',
                    cursor: 'grab',
                    transform: 'translate3d(0,0,0)',
                }}>
                <div ref={titlebarRef} className="window-titlebar">
                    <div className="window-close" onClick={onClose} />
                    <div className="window-title">{title}</div>
                </div>
                <div className="window-content">{children}</div>
                <div className="window-resizer" />
            </div>
        </StyledClassicModal>
    );
}
