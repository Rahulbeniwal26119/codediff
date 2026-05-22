import { toast } from 'react-hot-toast';
import { useCode } from '../context/CodeContext';

const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        return copied;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
};

const toastTheme = (isDarkTheme) => ({
    background: isDarkTheme ? '#17110d' : '#fffaf6',
    color: isDarkTheme ? '#fff7ed' : '#17120f',
    border: `1px solid ${isDarkTheme ? '#33261e' : '#ead8ca'}`,
    borderRadius: '12px',
});

export default function Share({ compact = false }) {
    const { leftContent, rightContent, selectedLanguage, isDarkTheme } = useCode();

    const showCopyResult = (copied) => {
        if (copied) {
            toast.success('Link copied', {
                duration: 1200,
                style: toastTheme(isDarkTheme),
            });
            return;
        }

        toast.error('Could not copy link. Select the URL manually.', {
            duration: 2500,
            style: toastTheme(isDarkTheme),
        });
    };

    const showShareToast = (shareUrl) => {
        const shortUrl = shareUrl.replace(/^https?:\/\//, '');

        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-[min(94vw,480px)] overflow-hidden rounded-xl border shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl ${
                    isDarkTheme
                        ? 'border-[#3a2a20] bg-[#15110e]/95 text-[#fff9f2]'
                        : 'border-[#ead8ca] bg-[#fffaf6]/95 text-[#17120f]'
                }`}
            >
                <div className="h-1 bg-gradient-to-r from-[#45d483] via-[#ff7a1a] to-[#7c3aed]" />
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#45d483]/15 text-[#45d483]">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-black tracking-normal">
                                        Diff link ready
                                    </p>
                                    <p className={`mt-0.5 text-xs font-semibold ${isDarkTheme ? 'text-[#a79b91]' : 'text-[#756a61]'}`}>
                                        Anyone with this link can view the diff.
                                    </p>
                                </div>
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
                                        isDarkTheme
                                            ? 'text-[#a79b91] hover:bg-[#241a14] hover:text-[#fff9f2]'
                                            : 'text-[#8a7a6e] hover:bg-[#f1e5dc] hover:text-[#17120f]'
                                    }`}
                                    title="Close"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className={`mt-3 flex h-10 min-w-0 items-center gap-2 rounded-lg border px-3 ${
                                isDarkTheme
                                    ? 'border-[#33261e] bg-[#0b0907]'
                                    : 'border-[#ead8ca] bg-white'
                            }`}>
                                <svg className="h-4 w-4 shrink-0 text-[#ff9a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6.75h3.75A2.25 2.25 0 0119.5 9v8.25a2.25 2.25 0 01-2.25 2.25H8.75a2.25 2.25 0 01-2.25-2.25V13.5m7-9H19.5m0 0v6m0-6l-10 10" />
                                </svg>
                                <input
                                    type="text"
                                    value={shortUrl}
                                    readOnly
                                    onFocus={(event) => event.target.select()}
                                    className={`min-w-0 flex-1 bg-transparent font-mono text-xs outline-none ${
                                        isDarkTheme ? 'text-[#9fb4d8]' : 'text-[#2563eb]'
                                    }`}
                                />
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={async () => showCopyResult(await copyToClipboard(shareUrl))}
                                    className="flex h-9 items-center gap-2 rounded-lg bg-[#ff7a1a] px-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(255,122,26,0.24)] transition hover:bg-[#ff8b33]"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                    </svg>
                                    Copy link
                                </button>
                                <button
                                    onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
                                    className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${
                                        isDarkTheme
                                            ? 'border-[#33261e] bg-[#1b130f] text-[#f6eee7] hover:border-[#ff7a1a]/45'
                                            : 'border-[#ead8ca] bg-white text-[#302822] hover:border-[#ff7a1a]/45'
                                    }`}
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            duration: 9000,
            position: 'top-center',
        });
    };

    const handleShare = async () => {
        if (!leftContent || !rightContent) {
            toast.error('Please add content to both sides before sharing', {
                duration: 3000,
                position: 'top-center',
                style: {
                    ...toastTheme(isDarkTheme),
                    border: `1px solid ${isDarkTheme ? '#ef4444' : '#f87171'}`,
                },
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/code-diff/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code_before: leftContent,
                    code_after: rightContent,
                    language: selectedLanguage,
                }),
            });

            if (!response.ok) {
                toast.error('Failed to share code. Please try again.', {
                    duration: 3000,
                    position: 'top-center',
                    style: toastTheme(isDarkTheme),
                });
                return;
            }

            const data = await response.json();
            const uuid = data.data.unique_identifier;
            showShareToast(`${window.location.origin}/${uuid}/`);
        } catch (error) {
            toast.error('Error sharing code', {
                duration: 3000,
                position: 'top-center',
                style: toastTheme(isDarkTheme),
            });
            console.error('Error sharing code', error);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={compact
                ? `group flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-all duration-200 ${
                    isDarkTheme
                        ? 'border-[#33261e] bg-[#17110d] text-[#f6eee7] hover:border-[#ff7a1a]/45 hover:bg-[#211812]'
                        : 'border-[#eadfd6] bg-white text-[#302822] hover:border-[#ff7a1a]/45 hover:bg-[#fff4ea]'
                }`
                : `p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                    isDarkTheme
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`
            }
            title="Share this diff"
        >
            <svg className={compact ? 'h-4 w-4 text-[#9fb4d8] transition group-hover:text-[#ff9a3d]' : 'w-4 h-4 sm:w-5 sm:h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className={compact ? 'hidden sm:inline' : 'hidden sm:inline text-sm'}>Share</span>
        </button>
    );
}
