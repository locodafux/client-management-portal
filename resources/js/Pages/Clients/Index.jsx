import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ clients, filters, auth, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [processing, setProcessing] = useState(false);

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

    const canEdit = auth.user.role !== 'staff';

    return (
            <AuthenticatedLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Clients
                        </h2>
                        <div className="flex space-x-2">
                            {canEdit && (
                                <>
                                    <Link
                                        href={route('clients.import.create')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Import Clients
                                    </Link>
                                    <Link
                                        href={route('clients.create')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Add New Client
                                    </Link>
                                </>
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
                                        {clients.data.map((client) => (
                                            <tr key={client.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {client.full_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.email}</div>
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
                                                        {client.services.map((service) => (
                                                            <span
                                                                key={service.id}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                                title={`Status: ${service.pivot.status}`}
                                                            >
                                                                {service.name}
                                                                <span className="ml-1 text-xs">
                                                                    ({service.pivot.status})
                                                                </span>
                                                            </span>
                                                        ))}
                                                        {client.services.length === 0 && (
                                                            <span className="text-xs text-gray-500">No services</span>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {clients.links && (
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