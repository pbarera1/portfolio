'use client';
import styled from 'styled-components';
import {
    FolderIcon,
    TrashIcon,
    FileIcon,
    SystemAliveIcon,
    BaselineApple,
    IconProps,
} from '@/components/Icons';
import {useState, useEffect, useRef} from 'react';
import {gsap} from 'gsap';
import {Draggable} from 'gsap/Draggable';
import ClassicModal from '@/components/ClassicModal';
import {projectData} from '@/app/projects/data';
import {Card} from '@/components/RecentHighlights';

gsap.registerPlugin(Draggable);

const StyledMonitor = styled.div`
    .label {
        background: #fff;
        padding: 4px;
    }

    .topbar {
        background: #fff;
        border-bottom: 2px solid black;
        padding: 0 16px;
        overflow-x: auto;
    }

    .icons {
        gap: 32px;
        align-items: flex-end;
        padding: 24px;
    }
    .menu-item {
        padding: 2px 8px;
        position: relative;
    }
    .menu-item:hover {
        color: #fff;
        background: #000;
    }

    .skill__header {
        font-weight: bold;
    }
    .skill {
        margin-bottom: 12px;
        break-inside: avoid;
    }
`;

const StyledDropDown = styled.div`
    position: fixed;
    z-index: 1;
    top: 40px;
    background: #fff;
    border: 1px solid var(--system7-border);
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
    padding: 2px 0;
    min-width: 160px;

    .item {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 2px 10px;
        cursor: default;
        white-space: nowrap;
        color: #000;
    }
    .item:hover {
        color: #fff;
        background: #000;
    }
`;

type ChildType = React.ReactNode | undefined;

interface IconWithTextProps {
    Icon: React.ComponentType<IconProps>;
    fill?: string;
    text?: string;
    children?: ChildType;
    href?: string;
}
const IconWithText = ({Icon, fill, text, children, href}: IconWithTextProps) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            {href ? (
                <>
                    <a
                        href={href}
                        className="icon flex flex-col text-6xl md:text-6xl align-items-center items-center">
                        <Icon fill={fill} />
                        <div className="label text-lg md:text-xl text-center">{text}</div>
                    </a>
                </>
            ) : (
                <>
                    <div
                        onClick={() => setOpen(true)}
                        className="icon flex flex-col text-6xl md:text-6xl align-items-center items-center">
                        <Icon fill={fill} />
                        <div className="label text-lg md:text-xl text-center">{text}</div>
                    </div>
                    <ClassicModal open={open} title={text} onClose={() => setOpen(false)}>
                        {children}
                    </ClassicModal>
                </>
            )}
        </>
    );
};

const MENU_DATA = [
    {
        title: 'File',
        children: [{title: 'Test', href: '/test/'}],
    },
    {
        title: 'Edit',
        children: [{title: 'Test', href: '/test/'}],
    },
    {
        title: 'View',
        children: [{title: 'Test', href: '/test/'}],
    },
    {
        title: 'Special',
        children: [{title: 'Test', href: '/test/'}],
    },
];

export default function Monitor() {
    const desktopRef = useRef(null);
    const [time, setTime] = useState<Date | null>(null);
    const [openMenuItem, setOpenMenuItem] = useState('');

    const handleMenuOpen = (title: string) => {
        setOpenMenuItem(title);
    };

    useEffect(() => {
        // initialize on mount
        setTime(new Date());
        // tick every minute
        const interval = setInterval(() => setTime(new Date()), 60_000);
        return () => clearInterval(interval);
    }, []);

    const dateString = time
        ? new Intl.DateTimeFormat(undefined, {
              hour: '2-digit',
              minute: '2-digit',
          })
              .format(time)
              .split(' ')?.[0]
        : '';

    useEffect(() => {
        // terrible close menu logic
        function handleDropDownClick(e: Event) {
            // 1. Check if e.target is null or undefined
            if (!e.target) {
                return;
            }

            // 2. Cast e.target to HTMLElement to access classList
            const targetElement = e.target as HTMLElement;
            if (
                targetElement.classList.contains('menu-title') ||
                targetElement.classList.contains('item')
            ) {
                return;
            }
            setOpenMenuItem('');
        }
        window.addEventListener('click', handleDropDownClick);
        const timeout = setInterval(() => {
            setTime(new Date());
        }, 60000);

        return () => {
            clearInterval(timeout);
            window.removeEventListener('click', handleDropDownClick);
        };
    }, []);

    useEffect(() => {
        const desktop = desktopRef.current;

        // make every .icon draggable within the desktop bounds
        const drags = Draggable.create('.icon', {
            bounds: desktop,
            type: 'x,y',
            inertia: false, // set to true if you have InertiaPlugin
            onPress() {
                // bring to front on pick-up
                gsap.set(this.target, {zIndex: 1, cursor: 'grabbing'});
            },
            onRelease() {
                gsap.set(this.target, {cursor: 'grab', zIndex: 'auto'});
            },
            onDragEnd() {
                const target = this.target;

                // Optional: snap to grid (comment out if you want free placement)
                const grid = 12;
                const x = Math.round(this.x / grid) * grid;
                const y = Math.round(this.y / grid) * grid;
                gsap.to(target, {duration: 0.1, x, y});
                gsap.set(this.target, {zIndex: 0});
            },
        });

        return () => drags.forEach((d) => d.kill());
    }, []);

    return (
        <StyledMonitor
            className="macos global-monitor flex flex-col justify-between"
            ref={desktopRef}>
            <div className="topbar flex gap-16 text-2xl p-4 justify-between">
                <div className="flex gap-4 relative">
                    <div className="flex justify-center items-center align-center text-3xl">
                        <BaselineApple />
                    </div>
                    {MENU_DATA.map(({title, children}) => (
                        <div
                            key={title}
                            className="menu-item"
                            onClick={() => handleMenuOpen(title)}>
                            <div className="menu-title text-lg md:text-xl">{title}</div>
                            {/* {openMenuItem === title && (
                                <StyledDropDown
                                    className="menu-dropdown"
                                    onClick={(e) => e.preventDefault()}>
                                    {children.map(({title}) => (
                                        <div
                                            key={title}
                                            className="item text-lg md:text-xl">
                                            {title}
                                        </div>
                                    ))}
                                </StyledDropDown>
                            )} */}
                        </div>
                    ))}
                </div>
                <div className="flex gap-8 align-center items-center justify-between text-lg md:text-xl">
                    <div>{dateString}</div>
                    <div>philOS</div>
                </div>
            </div>
            <div className="icons flex flex-col justify-self-end pad-8">
                <div className="flex flex-col align-items-center items-center gap-8">
                    <IconWithText fill={'#fff'} Icon={SystemAliveIcon} text="System">
                        <img
                            src="/matrix-2.gif"
                            width="498"
                            height="298"
                            loading="lazy"
                        />
                    </IconWithText>
                    <IconWithText fill={'#fff'} Icon={FolderIcon} text="Projects">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {projectData.map((project, index) => (
                                <IconWithText
                                    key={index}
                                    fill={'#fff'}
                                    Icon={FileIcon}
                                    text={project.name}>
                                    <Card
                                        className="rounded-none shadow-none border-none"
                                        label={project.label}
                                        title={project.name}
                                        href={`${project.slug}`}
                                        date={project.date}
                                        kicker={project.stack?.join(' · ')}
                                        image={project.coverImage}
                                        description={project.blurb}
                                        secondaryLinks={
                                            [
                                                project.repoUrl && {
                                                    label: 'Repo',
                                                    href: project.repoUrl,
                                                },
                                            ].filter(Boolean) as {
                                                label: string;
                                                href: string;
                                            }[]
                                        }
                                    />
                                </IconWithText>
                            ))}
                        </div>
                    </IconWithText>
                    <IconWithText fill={'#fff'} Icon={FileIcon} text="Skills">
                        <div>
                            <h3 className="skill__header text-lg">
                                Languages, Libraries & Frameworks
                            </h3>
                            <section className="skill columns-2 md:columns-3">
                                {[
                                    'JavaScript',
                                    'React',
                                    'Next.js',
                                    'Node.js',
                                    'Express',
                                    'HTML',
                                    'CSS',
                                    'PHP',
                                    'Wordpress',
                                ].map((item, index) => (
                                    <div key={index}>{item}</div>
                                ))}
                            </section>
                            <h3 className="skill__header text-lg">
                                Tooling & Infrastructure
                            </h3>
                            <section className="skill columns-2 md:columns-3">
                                {[
                                    'AWS',
                                    'Docker',
                                    'CI/CD',
                                    'Github Actions',
                                    'Nginx',
                                    'Cloudflare',
                                    'Jest',
                                    'React Testing Library',
                                    'Cursor',
                                ].map((item, index) => (
                                    <div key={index}>{item}</div>
                                ))}
                            </section>
                            <h3 className="skill__header text-lg">Databases & APIs</h3>
                            <section className="skill columns-2 md:columns-3">
                                {[
                                    'REST APIs',
                                    'MySQL',
                                    'PostgreSQL',
                                    'MongoDB',
                                    'Redis',
                                    'Postman',
                                    'Lambda',
                                ].map((item, index) => (
                                    <div key={index}>{item}</div>
                                ))}
                            </section>
                            <h3 className="skill__header text-lg">Other</h3>
                            <section className="skill columns-2 md:columns-3">
                                {[
                                    'Git',
                                    'Agile/Scrum',
                                    'JIRA',
                                    'UX/UI Collaboration',
                                    'Performance Optimization',
                                    'Figma',
                                    'Storybook',
                                    'SEO',
                                    'Web Security',
                                    'Accessability',
                                ].map((item, index) => (
                                    <div key={index}>{item}</div>
                                ))}
                            </section>
                        </div>
                    </IconWithText>
                    <IconWithText
                        fill={'#fff'}
                        Icon={FileIcon}
                        text="Resume"
                        href="/phil-barera-resume-1.pdf"
                    />
                    <IconWithText fill={'#fff'} Icon={TrashIcon} text="Trash">
                        <img src="/raccoon.jpg" width="498" height="298" loading="lazy" />
                    </IconWithText>
                </div>
            </div>
        </StyledMonitor>
    );
}
