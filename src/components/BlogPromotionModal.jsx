import { useEffect, useState } from 'react';
import { FaArrowRight, FaBookOpen, FaTimes } from 'react-icons/fa';
import { useCode } from '../context/CodeContext';
import { cn } from '../utils/cn';

const STORAGE_KEY = 'codediffPromotionLastShown';

const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, { timeout: 8000 });
    }

    return window.setTimeout(callback, 1000);
};

const cancelIdleRun = (id) => {
    if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(id);
        return;
    }

    window.clearTimeout(id);
};

export default function BlogPromotionModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { isDarkTheme } = useCode();

    useEffect(() => {
        const lastShown = localStorage.getItem(STORAGE_KEY);
        const today = new Date().toDateString();

        if (lastShown === today) return undefined;

        const timer = window.setTimeout(() => {
            const idleId = runWhenIdle(() => setIsVisible(true));

            window.setTimeout(() => cancelIdleRun(idleId), 9000);
        }, 16000);

        return () => window.clearTimeout(timer);
    }, []);

    const rememberDismissal = () => {
        localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    };

    const handleClose = () => {
        setIsClosing(true);
        rememberDismissal();

        window.setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
        }, 220);
    };

    const handleVisitTakoVibe = () => {
        window.open('https://takovibe.com', '_blank', 'noopener,noreferrer');
        handleClose();
    };

    if (!isVisible) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-3 sm:inset-x-auto sm:right-4 sm:justify-end sm:p-4">
            <section
                className={cn(
                    'pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition duration-200',
                    isClosing ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100',
                    isDarkTheme
                        ? 'border-[#35251b] bg-[#100d0b]/95 text-[#fff9f2]'
                        : 'border-[#ead8ca] bg-[#fffaf6]/95 text-[#17120f]'
                )}
                role="dialog"
                aria-label="TakoVibe promotion"
            >
                <div className="border-b border-[#ff7a1a]/15 bg-gradient-to-r from-[#ff7a1a]/16 via-[#ff7a1a]/8 to-[#7c3aed]/12 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#7c3aed] text-sm font-black text-white shadow-[0_0_34px_rgba(255,122,26,0.24)]">
                                TV
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff9a3d]">
                                    Built by TakoVibe
                                </p>
                                <h2 className="mt-0.5 truncate text-base font-black">
                                    TakoVibe
                                </h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className={cn(
                                'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition',
                                isDarkTheme ? 'text-[#9a9087] hover:bg-white/5 hover:text-white' : 'text-[#756a61] hover:bg-black/5 hover:text-[#17120f]'
                            )}
                            aria-label="Dismiss promotion"
                        >
                            <FaTimes className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <p className={cn('text-sm leading-6', isDarkTheme ? 'text-[#cfc4ba]' : 'text-[#675b52]')}>
                        CodeDiff is one of the focused developer tools coming from TakoVibe. Explore product notes, dev workflows, and practical engineering ideas.
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {['Dev tools', 'Build notes', 'Tutorials'].map((item) => (
                            <span
                                key={item}
                                className={cn(
                                    'rounded-lg border px-2 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.08em]',
                                    isDarkTheme
                                        ? 'border-[#2b211b] bg-[#0c0a08] text-[#b7aca2]'
                                        : 'border-[#ead8ca] bg-[#fff4eb] text-[#675b52]'
                                )}
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleVisitTakoVibe}
                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#ff7a1a] px-3 text-xs font-black text-white shadow-[0_12px_28px_rgba(255,122,26,0.22)] transition hover:bg-[#ff8b33]"
                        >
                            Visit TakoVibe
                            <FaArrowRight className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={cn(
                                'h-9 rounded-lg px-3 text-xs font-bold transition',
                                isDarkTheme ? 'text-[#b7aca2] hover:bg-white/5 hover:text-white' : 'text-[#675b52] hover:bg-black/5 hover:text-[#17120f]'
                            )}
                        >
                            Not now
                        </button>
                    </div>

                    <div className={cn('mt-3 flex items-center justify-between gap-3 text-[10px] font-bold', isDarkTheme ? 'text-[#7d7168]' : 'text-[#8b7d72]')}>
                        <span className="flex items-center gap-1.5">
                            <FaBookOpen className="h-3 w-3 text-[#ff9a3d]" />
                            New builder notes weekly
                        </span>
                        <span className="rounded-full border border-[#ff7a1a]/20 bg-[#ff7a1a]/10 px-2 py-0.5 text-[#ff9a3d]">
                            takovibe.com
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
