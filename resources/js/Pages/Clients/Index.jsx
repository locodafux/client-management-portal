// resources/js/Pages/Clients/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ clients, filters, auth, flash, recentImports = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [processing, setProcessing] = useState(false);
    const [imports, setImports] = useState(recentImports);
    const [showImports, setShowImports] = useState(false);

    // Auto-polling every 5 seconds
    useEffect(() => {
        const hasActiveImports = imports.some(
            imp => imp.status === 'Queued' || imp.status === 'Processing'
        );
        
        if (hasActiveImports) {
            const interval = setInterval(refreshImports, 5000);
            return () => clearInterval(interval);
        }
    }, [imports]);

    const refreshImports = () => {
        router.get(route('clients.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['recentImports'],
            onSuccess: (page) => {
                if (page.props.recentImports) {
                    setImports(page.props.recentImports);
                }
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/clients', { 
            search, 
            status: statusFilter 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        router.get('/clients', { 
            search, 
            status: newStatus 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleDelete = (client) => {
        if (confirm(`Are you sure you want to delete ${client.full_name}?`)) {
            setProcessing(true);
            router.delete(route('clients.destroy', client.id), {
                onFinish: () => setProcessing(false),
            });
        }
    };

    const getStatusBadgeColor = (status) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Lead': return 'bg-yellow-100 text-yellow-800';
            case 'Inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getServiceStatusBadgeColor = (status) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getImportStatusBadge = (status) => {
        switch(status) {
            case 'Completed':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
            case 'Processing':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Processing</span>;
            case 'Queued':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Queued</span>;
            case 'Failed':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const canEdit = auth.user.role !== 'staff';
    const canImport = auth.user.role === 'admin' || auth.user.role === 'manager';
    const hasActiveImports = imports.some(imp => imp.status === 'Queued' || imp.status === 'Processing');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Clients
                        </h2>
                        
                        {/* Active Import Indicator */}
                        {hasActiveImports && (
                            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                <div className="animate-pulse flex space-x-1 mr-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                                <span>Import in progress...</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        {canImport && (
                            <>
                                <button
                                    onClick={() => setShowImports(!showImports)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    {showImports ? 'Hide Imports' : 'Show Imports'}
                                </button>
                                <Link
                                    href={route('clients.import.create')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Import Clients
                                </Link>
                            </>
                        )}
                        {canEdit && (
                            <Link
                                href={route('clients.create')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add New Client
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Clients" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Imports Section - Shows only when showImports is true */}
                    {showImports && imports.length > 0 && (
                        <div className="mb-6 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Imports</h3>
                                    {hasActiveImports && (
                                        <span className="text-xs text-gray-500 animate-pulse">
                                            Auto-refreshing every 5 seconds...
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {imports.map((importItem) => (
                                        <div key={importItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {importItem.filename}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {importItem.created_at}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    {getImportStatusBadge(importItem.status)}
                                                </div>
                                                {importItem.status === 'Completed' && (
                                                    <div className="text-sm">
                                                        <span className="text-green-600 font-medium">
                                                            +{importItem.imported_count}
                                                        </span>
                                                        {importItem.skipped_count > 0 && (
                                                            <span className="text-yellow-600 ml-2 font-medium" title="Skipped">
                                                                ⤻ {importItem.skipped_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {importItem.status === 'Processing' && importItem.imported_count + importItem.skipped_count > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        {importItem.imported_count + importItem.skipped_count} rows
                                                    </div>
                                                )}
                                                {importItem.status === 'Failed' && importItem.error_message && (
                                                    <div className="text-xs text-red-500 max-w-xs truncate" title={importItem.error_message}>
                                                        Error: {importItem.error_message}
                                                    </div>
                                                )}
                                                {importItem.status === 'Queued' && (
                                                    <div className="text-xs text-gray-500">
                                                        Waiting to start...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="bg-white p-4 mb-4 rounded-lg shadow">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="w-48">
                                <select
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Clients Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                                            {canEdit && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clients.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={canEdit ? "8" : "7"} className="px-6 py-4 text-center text-gray-500">
                                                    No clients found.
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.data.map((client) => (
                                                <tr key={client.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {client.full_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{client.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{client.phone || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{client.company_name || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(client.status)}`}>
                                                            {client.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {client.assigned_staff?.name || 'Unassigned'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {client.services && client.services.length > 0 ? (
                                                                client.services.map((service) => (
                                                                    <span
                                                                        key={service.id}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                                                        title={`Status: ${service.pivot.status}`}
                                                                    >
                                                                        {service.name}
                                                                        <span className={`ml-1 px-1 rounded text-xs ${getServiceStatusBadgeColor(service.pivot.status)}`}>
                                                                            {service.pivot.status}
                                                                        </span>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400">No services</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {canEdit && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <Link
                                                                href={route('clients.edit', client.id)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(client)}
                                                                disabled={processing}
                                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {clients.links && clients.links.length > 3 && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Showing {clients.from} to {clients.to} of {clients.total} clients
                                    </div>
                                    <div className="flex space-x-2">
                                        {clients.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                preserveState
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}