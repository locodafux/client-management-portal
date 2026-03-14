import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ services, flash, auth }) {
    const [processing, setProcessing] = useState(false);

    const handleToggleActive = (service) => {
        if (confirm(`Are you sure you want to ${service.is_active ? 'deactivate' : 'activate'} ${service.name}?`)) {
            setProcessing(true);
            router.patch(route('services.toggle-active', service.id), {}, {
                onFinish: () => setProcessing(false),
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (service) => {
        if (confirm(`Are you sure you want to delete ${service.name}? This action cannot be undone.`)) {
            setProcessing(true);
            router.delete(route('services.destroy', service.id), {
                onFinish: () => setProcessing(false),
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Services Management
                    </h2>
                    <Link
                        href={route('services.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add New Service
                    </Link>
                </div>
            }
        >
            <Head title="Services Management" />

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

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.data.map((service) => (
                                            <tr key={service.id} className={!service.is_active ? 'bg-gray-50' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {service.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {service.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        service.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {service.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={route('services.edit', service.id)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleActive(service)}
                                                        disabled={processing}
                                                        className={`${
                                                            service.is_active 
                                                                ? 'text-yellow-600 hover:text-yellow-900' 
                                                                : 'text-green-600 hover:text-green-900'
                                                        } mr-3 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {service.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service)}
                                                        disabled={processing}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {services.links && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Showing {services.from} to {services.to} of {services.total} services
                                    </div>
                                    <div className="flex space-x-2">
                                        {services.links.map((link, index) => (
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