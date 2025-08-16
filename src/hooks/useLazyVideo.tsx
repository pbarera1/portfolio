import {useEffect, useState, RefObject} from 'react';

export function useLazyVideo<T extends Element>(
    ref: React.RefObject<Element | null>,
    options: IntersectionObserverInit = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    },
): boolean {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isVisible) return; // already visible, skip
        const el = ref.current;
        if (!el) return;

        // SSR / old browsers: no IntersectionObserver → show immediately
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect(); // stop observing after first reveal
            }
        }, options);

        observer.observe(el);
        return () => observer.disconnect();
        // keep deps stable; if you pass custom options, memoize them with useMemo
    }, [ref, isVisible, options.root, options.rootMargin, options.threshold]);

    return isVisible;
}
