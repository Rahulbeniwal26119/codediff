import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useCode } from '../context/CodeContext';

// Debounce Hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const BASE_URL = process.env.REACT_APP_API_URL;
const BASE_URL_FRONTEND = process.env.REACT_APP_BASE_URL;

export default function ManageLinksModal({ onClose }) {
    const { isDarkTheme } = useCode();
    const [diffs, setDiffs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [diffToDelete, setDiffToDelete] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const itemsPerPage = 10;
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const columnHelper = createColumnHelper();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year}, ${hours}:${minutes}:00`;
    };

    const get_link = (id) => {
        const url = `${BASE_URL_FRONTEND}/${id}`;
        return (
            <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`font-mono text-sm transition-colors duration-200 hover:underline ${
                    isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
            >
                {id}
            </a>
        );
    }

    const confirmDelete = (id) => {
        setDiffToDelete(id);
    };

    const cancelDelete = () => {
        setDiffToDelete(null);
    };

    const fetchDiffs = useCallback(async (page = 1) => {
        try {
            const access_token = localStorage.getItem('access_token');
            const response = await fetch(
                `${BASE_URL}/api/code-diff/?page=${page}&q=${debouncedSearchTerm}`,
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );

        
            const data = await response.json();
            if (response.ok) {
                setTotalCount(data.count);
                setNextPage(data.next);
                setPrevPage(data.previous);
                
                if (data.results.length === 0) {
                    setIsLoading(false);
                    return [];
                }
                
                return data.results.map(diff => ({
                    id: diff.unique_identifier,
                    createdOn: diff.created_at,
                    lastUpdated: diff.updated_at,
                    info: `${diff.language} Comparison`,
                    is_active: diff.is_active,
                    unique_identifier: diff.unique_identifier,
                    delete_link: `${BASE_URL}/api/code-diff/${diff.unique_identifier}/`,
                }));
            } else {
                console.error('Error fetching diffs:', data.detail);
                throw new Error(data.detail);
            }
        } catch (error) {
            console.error('Error fetching diffs:', error);
            setIsLoading(false);
            return [];
        }
    }, [debouncedSearchTerm]);

    const handleToggleActive = useCallback(async (diff) => {
        try {
            const access_token = localStorage.getItem('access_token');
            const response = await fetch(
                `${BASE_URL}/api/code-diff/${diff.unique_identifier}/toggle-diff/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const result = await fetchDiffs(currentPage);
                setDiffs(result);
            } else {
                console.error('Error toggling diff status');
            }
        } catch (error) {
            console.error('Error toggling diff status:', error);
        }
    }, [fetchDiffs, currentPage]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Diff',
                cell: info => get_link(info.getValue()),
            }),
            columnHelper.accessor('createdOn', {
                header: 'Created On',
                cell: info => formatDate(info.getValue()),
            }),
            columnHelper.accessor('lastUpdated', {
                header: 'Last Updated',
                cell: info => formatDate(info.getValue()),
            }),
            columnHelper.accessor('info', {
                header: 'Diff Info',
                cell: info => info.getValue(),
            }),
            columnHelper.accessor('is_active', {
                header: 'Status',
                cell: info => (
                    <button
                        onClick={() => handleToggleActive(info.row.original)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            info.getValue()
                                ? isDarkTheme 
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                : isDarkTheme
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        }`}
                        title={`Click to ${info.getValue() ? 'deactivate' : 'activate'} this diff`}
                    >
                        {info.getValue() ? 'Active' : 'Inactive'}
                    </button>
                ),
            }),
            columnHelper.accessor('id', {
                id: 'actions',
                header: 'Actions',
                cell: info => (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => confirmDelete(info.row.original)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                                isDarkTheme 
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title="Delete diff"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ),
            }),
        ],
        [columnHelper, handleToggleActive]
    );

    const table = useReactTable({
        data: diffs,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleDelete = async (id, deleteLink) => {
        try {
            const access_token = localStorage.getItem('access_token');
            const response = await fetch(deleteLink, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (response.ok) {
                const result = await fetchDiffs(currentPage);
                setDiffs(result);
                setDiffToDelete(null);
            } else {
                console.error('Error deleting diff');
            }
        } catch (error) {
            console.error('Error deleting diff:', error);
        }
    };

    useEffect(() => {
        const loadDiffs = async () => {
            const result = await fetchDiffs(currentPage);
            setDiffs(result);
            setIsLoading(false);
        };

        loadDiffs();
    }, [currentPage, debouncedSearchTerm, fetchDiffs]);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className={`rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border ${
                isDarkTheme 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-6 border-b ${
                    isDarkTheme 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                            <svg className={`w-5 h-5 ${
                                isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className={`text-xl font-bold ${
                            isDarkTheme ? 'text-white' : 'text-gray-900'
                        }`}>
                            Manage Your Diffs
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                            isDarkTheme 
                                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className={`p-6 border-b ${
                    isDarkTheme 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                }`}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className={`w-4 h-4 ${
                                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search diffs by ID or language..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkTheme 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                            }`}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className={`overflow-auto flex-grow ${
                    isDarkTheme ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                                isDarkTheme ? 'border-blue-400' : 'border-blue-600'
                            }`}></div>
                            <p className={`mt-4 text-sm ${
                                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                            }`}>Loading your diffs...</p>
                        </div>
                    ) : diffs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className={`p-3 rounded-full ${
                                isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                                <svg className={`w-8 h-8 ${
                                    isDarkTheme ? 'text-gray-500' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className={`mt-4 text-lg font-medium ${
                                isDarkTheme ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                                {searchTerm ? 'No diffs match your search' : 'No diffs found'}
                            </p>
                            <p className={`mt-1 text-sm ${
                                isDarkTheme ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                                {searchTerm ? 'Try adjusting your search terms' : 'Create your first diff to see it here'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className={isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th 
                                                    key={header.id}
                                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                                                        isDarkTheme ? 'text-gray-300' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            {...{
                                                                className: header.column.getCanSort()
                                                                    ? 'cursor-pointer select-none flex items-center gap-2 hover:text-blue-500'
                                                                    : '',
                                                                onClick: header.column.getToggleSortingHandler(),
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className={`divide-y ${
                                    isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'
                                }`}>
                                    {table.getRowModel().rows.map((row, index) => (
                                        <tr key={row.id} className={`transition-colors duration-200 ${
                                            isDarkTheme 
                                                ? 'hover:bg-gray-700 even:bg-gray-800/50' 
                                                : 'hover:bg-gray-50 even:bg-gray-50/50'
                                        }`}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className={`px-6 py-4 text-sm whitespace-nowrap ${
                                                    isDarkTheme ? 'text-gray-300' : 'text-gray-900'
                                                }`}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalCount > itemsPerPage && (
                    <div className={`flex justify-between items-center px-6 py-4 border-t ${
                        isDarkTheme 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={!prevPage}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !prevPage 
                                        ? isDarkTheme
                                            ? 'bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                                        : isDarkTheme
                                            ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                            : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            
                            <span className={`text-sm ${
                                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                                <span className="font-medium">{totalCount}</span> results
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-medium ${
                                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={!nextPage}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    !nextPage 
                                        ? isDarkTheme
                                            ? 'bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                                        : isDarkTheme
                                            ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                            : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                {diffToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                        <div className={`rounded-xl shadow-2xl p-6 max-w-md w-full border ${
                            isDarkTheme 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${
                                    isDarkTheme ? 'bg-red-500/20' : 'bg-red-100'
                                }`}>
                                    <svg className={`w-5 h-5 ${
                                        isDarkTheme ? 'text-red-400' : 'text-red-600'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-bold ${
                                    isDarkTheme ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Confirm Delete
                                </h3>
                            </div>
                            
                            <p className={`mb-6 text-sm leading-relaxed ${
                                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Are you sure you want to delete the diff <span className={`font-mono px-1 py-0.5 rounded text-xs ${
                                    isDarkTheme ? 'bg-gray-700 text-blue-400' : 'bg-gray-100 text-blue-600'
                                }`}>{diffToDelete.id}</span>? This action cannot be undone and will permanently remove all associated data.
                            </p>
                            
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={cancelDelete}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isDarkTheme 
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleDelete(diffToDelete.id, diffToDelete.delete_link)}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all duration-200 border border-red-600"
                                >
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
} 