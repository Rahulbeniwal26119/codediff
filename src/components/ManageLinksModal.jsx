import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

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
        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
            {id}
        </a>
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
                        className={`px-2 py-1 rounded-full text-xs ${
                            info.getValue()
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                        }`}
                    >
                        {info.getValue() ? 'Active' : 'Inactive'}
                    </button>
                ),
            }),
            columnHelper.accessor('id', {
                id: 'actions',
                header: 'Action',
                cell: info => (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => confirmDelete(info.row.original)}
                            className="text-red-500 hover:text-red-400"
                            title="Delete diff"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] text-gray-200 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-[#262626] border-b border-[#404040]">
                    <h2 className="text-xl font-semibold">Manage Diffs</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-[#262626]">
                    <input
                        type="text"
                        placeholder="Search diffs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 rounded bg-[#404040] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Table */}
                <div className="overflow-auto flex-grow">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : diffs.length === 0 ? (
                        <div className="p-4 text-center">No diffs found</div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-[#262626] text-xs uppercase">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th 
                                                key={header.id}
                                                className="px-4 py-3 text-left"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        {...{
                                                            className: header.column.getCanSort()
                                                                ? 'cursor-pointer select-none flex items-center gap-2'
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
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="border-t border-[#404040] hover:bg-[#404040]">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-4 py-3 text-sm">
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
                    )}
                </div>

                {/* Pagination */}
                {totalCount > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 bg-[#262626] border-t border-[#404040]">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={!prevPage}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                                !prevPage 
                                    ? 'bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border cursor-not-allowed'
                                    : 'bg-[#5131cf] text-gray-200 border-gray-600 hover: border'
                            }`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!nextPage}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                                !nextPage 
                                    ? 'bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border cursor-not-allowed'
                                    : 'bg-[#5131cf] text-gray-200 border-gray-600 hover: border'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                {diffToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-[#1a1a1a] text-gray-200 rounded-lg shadow-lg p-6 max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                            <p className="mb-6">Are you sure you want to delete this diff? This action cannot be undone.</p>
                            <div className="flex justify-end gap-4">
                                <button 
                                    onClick={cancelDelete}
                                    className="px-4 py-2 rounded bg-[#404040] hover:bg-opacity-80 text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleDelete(diffToDelete.id, diffToDelete.delete_link)}
                                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 