import { toast } from 'react-hot-toast';
import { useCode } from '../context/CodeContext';

const API_URL = process.env.REACT_APP_API_URL;

// Utility function to copy text with fallback methods
const copyToClipboard = async (text) => {
    try {
        // Method 1: Modern Clipboard API (requires HTTPS)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return { success: true, method: 'clipboard-api' };
        }
        
        // Method 2: Fallback using document.execCommand (deprecated but widely supported)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            return { success: true, method: 'execCommand' };
        }
        
        throw new Error('execCommand failed');
        
    } catch (err) {
        console.error('Copy failed:', err);
        return { success: false, error: err.message };
    }
};

export default function Share() {
    const { leftContent, rightContent, selectedLanguage, isDarkTheme } = useCode();

    const handleShare = async () => {
        const accessToken = localStorage.getItem('access_token');
        if (!leftContent || !rightContent) {
            toast.error(
                'Please add content to both sides before sharing',
                {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        borderRadius: '12px',
                        background: isDarkTheme ? '#374151' : '#f9fafb',
                        color: isDarkTheme ? '#f3f4f6' : '#111827',
                        border: `1px solid ${isDarkTheme ? '#ef4444' : '#f87171'}`,
                        padding: '16px',
                        fontSize: '14px',
                        boxShadow: isDarkTheme 
                            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                }
            )
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/code-diff/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
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
                    style: {
                        borderRadius: '12px',
                        background: isDarkTheme ? '#374151' : '#f9fafb',
                        color: isDarkTheme ? '#f3f4f6' : '#111827',
                        border: `1px solid ${isDarkTheme ? '#ef4444' : '#f87171'}`,
                        padding: '16px',
                        fontSize: '14px',
                        boxShadow: isDarkTheme 
                            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }
                })
                return;
            }

            const data = await response.json();
            console.log(data)
            console.log(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            )
            const uuid = data.data.unique_identifier;
            // take current url and append uuid to it
            const shareUrl = `${window.location.origin}/${uuid}/`;

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md sm:max-w-lg lg:max-w-xl w-full shadow-xl rounded-xl pointer-events-auto ring-1 border relative ${
                    isDarkTheme 
                        ? 'bg-gray-800 border-gray-700 ring-gray-700' 
                        : 'bg-white border-gray-200 ring-gray-200'
                }`}
                >
                    {/* Top-right close button */}
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 z-10 ${
                            isDarkTheme 
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Close notification"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="p-4 pr-12">
                        <div className="flex items-start gap-3">
                            {/* Success Icon */}
                            <div className={`flex-shrink-0 p-2 rounded-lg ${
                                isDarkTheme ? 'bg-green-500/20' : 'bg-green-100'
                            }`}>
                                <svg className={`w-5 h-5 ${
                                    isDarkTheme ? 'text-green-400' : 'text-green-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${
                                    isDarkTheme ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                    🎉 Diff Link Generated Successfully!
                                </p>
                                <p className={`mt-1 text-xs ${
                                    isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    Share this link with your team or save it for later
                                </p>
                                
                                {/* URL Display with Copy functionality - Responsive */}
                                <div className={`mt-3 p-2 rounded-lg border ${
                                    isDarkTheme 
                                        ? 'bg-gray-700 border-gray-600' 
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                    {/* Mobile: Show shortened URL */}
                                    <div className="block sm:hidden">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs ${
                                                    isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    Link ready to share
                                                </p>
                                                <p className={`text-xs font-mono truncate ${
                                                    isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                                                }`}>
                                                    .../{shareUrl.split('/').pop()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const result = await copyToClipboard(shareUrl);
                                                    if (result.success) {
                                                        toast.success('Link copied!', { 
                                                            duration: 1500,
                                                            style: {
                                                                background: isDarkTheme ? '#374151' : '#f9fafb',
                                                                color: isDarkTheme ? '#f3f4f6' : '#111827',
                                                                border: `1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}`,
                                                            }
                                                        });
                                                    } else {
                                                        toast.error('Failed to copy. Please copy manually.', { 
                                                            duration: 2000,
                                                            style: {
                                                                background: isDarkTheme ? '#374151' : '#f9fafb',
                                                                color: isDarkTheme ? '#f3f4f6' : '#111827',
                                                            }
                                                        });
                                                    }
                                                }}
                                                className={`flex-shrink-0 p-1.5 rounded-md transition-colors duration-200 ${
                                                    isDarkTheme 
                                                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                                }`}
                                                title="Copy full link"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop: Show full URL */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                className={`w-full text-xs font-mono bg-transparent border-none outline-none ${
                                                    isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                                                }`}
                                                onFocus={(e) => e.target.select()}
                                                title="Click to select the URL"
                                            />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const result = await copyToClipboard(shareUrl);
                                                if (result.success) {
                                                    toast.success('Copied to clipboard!', { 
                                                        duration: 1500,
                                                        style: {
                                                            background: isDarkTheme ? '#374151' : '#f9fafb',
                                                            color: isDarkTheme ? '#f3f4f6' : '#111827',
                                                            border: `1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}`,
                                                        }
                                                    });
                                                } else {
                                                    toast.error('Failed to copy. Please copy manually.', { 
                                                        duration: 2000,
                                                        style: {
                                                            background: isDarkTheme ? '#374151' : '#f9fafb',
                                                            color: isDarkTheme ? '#f3f4f6' : '#111827',
                                                        }
                                                    });
                                                }
                                            }}
                                            className={`flex-shrink-0 p-1.5 rounded-md transition-colors duration-200 ${
                                                isDarkTheme 
                                                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                            }`}
                                            title="Copy to clipboard"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            const result = await copyToClipboard(shareUrl);
                                            if (result.success) {
                                                toast.success('Link copied!', { 
                                                    duration: 1000,
                                                    style: {
                                                        background: isDarkTheme ? '#374151' : '#f9fafb',
                                                        color: isDarkTheme ? '#f3f4f6' : '#111827',
                                                    }
                                                });
                                            } else {
                                                // Show a fallback modal or instructions
                                                toast((t) => (
                                                    <div className={`p-4 rounded-lg ${
                                                        isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                                                    }`}>
                                                        <p className="font-medium mb-2">Copy Link Manually</p>
                                                        <div className={`p-2 rounded border font-mono text-sm ${
                                                            isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                                                        }`}>
                                                            {shareUrl}
                                                        </div>
                                                        <button
                                                            onClick={() => toast.dismiss(t.id)}
                                                            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                ), {
                                                    duration: 10000,
                                                    position: 'top-center',
                                                });
                                            }
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            isDarkTheme 
                                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy Link
                                    </button>
                                    
                                    <button
                                        onClick={() => window.open(shareUrl, '_blank')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            isDarkTheme 
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ), {
                duration: 8000,
                position: 'top-center',
            });

        } catch (error) {
            toast.error('Error sharing code', {
                duration: 3000,
                position: 'top-center',
                style: {
                    borderRadius: '12px',
                    background: isDarkTheme ? '#374151' : '#f9fafb',
                    color: isDarkTheme ? '#f3f4f6' : '#111827',
                    border: `1px solid ${isDarkTheme ? '#ef4444' : '#f87171'}`,
                    padding: '16px',
                    fontSize: '14px',
                    boxShadow: isDarkTheme 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
            });
            console.error('Error sharing code', error);
        }
    };

    return (
        <button 
            onClick={() => handleShare({ leftContent, rightContent, selectedLanguage })}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                isDarkTheme 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Share this diff"
        >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline text-sm">Share</span>
        </button>
    );
}
