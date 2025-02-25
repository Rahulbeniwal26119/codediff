import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function UpdateLink({ leftContent, rightContent, selectedLanguage }) {
    const { diffId } = useParams();

    const handleUpdate = async ({ leftContent, rightContent, selectedLanguage }) => {
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

        console.log(leftContent, rightContent, selectedLanguage);

        try {
            const response = await fetch(`${API_URL}/api/code-diff/${diffId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code_before: leftContent,
                    code_after: rightContent,
                    language: selectedLanguage,
                }),
            });
            console.log(response);

            if (!response.ok) {
                toast.error('Failed to update code', {
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
                                    🎉 Update Successfull !!
                                </p>
                                <p className="mt-1 text-sm text-gray-400 truncate">

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
            toast.error('Error updating code', {
                duration: 2000,
                position: 'top-center',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            console.error('Error updating code', error);
        }
    };

    return (
        <button
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border"

            onClick={() => handleUpdate({ leftContent, rightContent, selectedLanguage })}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update Diff
        </button>
    );
}
