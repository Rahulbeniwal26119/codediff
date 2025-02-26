import { useState, useEffect } from 'react';

export default function ManageLinksModal({ onClose }) {
    const [diffs, setDiffs] = useState([]);
    const [filteredDiffs, setFilteredDiffs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [diffToDelete, setDiffToDelete] = useState(null);
    
    const itemsPerPage = 10;

    useEffect(() => {
        // Mock data
        const mockDiffs = [
            { id: 'abc123', createdOn: '2023-07-12T14:30:00Z', lastUpdated: '2023-07-12T15:45:00Z', info: 'JavaScript comparison' },
            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },            { id: 'def456', createdOn: '2023-07-11T10:20:00Z', lastUpdated: '2023-07-11T11:15:00Z', info: 'Python code review' },
            // Add more mock data as needed
        ];
        
        setDiffs(mockDiffs);
        setFilteredDiffs(mockDiffs);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDiffs(diffs);
        } else {
            const filtered = diffs.filter(diff => 
                diff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                diff.info.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDiffs(filtered);
        }
        setCurrentPage(1);
    }, [searchTerm, diffs]);

    const confirmDelete = (id) => {
        setDiffToDelete(id);
    };

    const cancelDelete = () => {
        setDiffToDelete(null);
    };

    const deleteDiff = () => {
        setDiffs(diffs.filter(diff => diff.id !== diffToDelete));
        setDiffToDelete(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year}, ${hours}:${minutes}:00`;
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredDiffs.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDiffs.slice(indexOfFirstItem, indexOfLastItem);

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
                    ) : filteredDiffs.length === 0 ? (
                        <div className="p-4 text-center">No diffs found</div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-[#262626] text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Diff ID</th>
                                    <th className="px-4 py-3 text-left">Created On</th>
                                    <th className="px-4 py-3 text-left">Last Updated</th>
                                    <th className="px-4 py-3 text-left">Diff Info</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((diff) => (
                                    <tr key={diff.id} className="border-t border-[#404040] hover:bg-[#404040]">
                                        <td className="px-4 py-3 text-sm">{diff.id}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(diff.createdOn)}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(diff.lastUpdated)}</td>
                                        <td className="px-4 py-3 text-sm">{diff.info}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <button 
                                                onClick={() => confirmDelete(diff.id)}
                                                className="text-red-500 hover:text-red-400"
                                                title="Delete diff"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 bg-[#262626] border-t border-[#404040]">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded ${currentPage === 1 
                                ? 'bg-[#3c4657] text-gray-500 cursor-not-allowed' 
                                : 'bg-[#3c4657] text-white hover:bg-opacity-80'}`}
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded ${currentPage === totalPages 
                                ? 'bg-[#3c4657] text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
                                    onClick={deleteDiff}
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