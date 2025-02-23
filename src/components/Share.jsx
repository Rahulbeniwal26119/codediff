import { toast } from 'react-hot-toast';
const API_URL = process.env.REACT_APP_API_URL;

export default function Share({ leftContent, rightContent, selectedLanguage }) {

    const handleShare = async () => {
        if (!leftContent || !rightContent) {
            toast.error(
                'Empty files cannot be shared',
                {
                    duration: 2000,
                    position: 'top-center',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
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
                },
                body: JSON.stringify({
                    code_before: leftContent,
                    code_after: rightContent,
                    language: selectedLanguage,
                }),
            });

            if (!response.ok) {
                toast.error('Failed to share code', {
                    duration: 2000,
                    position: 'top-center',
                    style: {

                    }
                })
                return;
            }

            const data = await response.json();
            const uuid = data.data.unique_identifier;
            // take current url and append uuid to it
            const shareUrl = `${window.location.origin}/${uuid}/`;

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-[#333] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-200">
                                    🎉 Link Generated!!
                                </p>
                                <p className="mt-1 text-sm text-gray-400 truncate">
                                    {shareUrl}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-600">
                        <button
                            onClick={async () => {
                                await navigator.clipboard.writeText(shareUrl);
                                toast.success('Copied again!', { duration: 1000 });
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#404040] focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#404040] focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center',
            });

        } catch (error) {
            toast.error('Error sharing code', {
                duration: 2000,
                position: 'top-center',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            console.error('Error sharing code', error);
        }
    };

    return (
        <button
            className="share-button inline-flex items-center gap-2 bg-[#252526] hover:bg-[#2d2d2d] border border-[#404040] hover:border-[#565656] rounded-sm px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-all duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#565656] active:bg-[#313131]"
            onClick={() => handleShare({ leftContent, rightContent, selectedLanguage })}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
        </button>
    );
}
