// resources/js/Pages/Clients/Edit.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ client, staffUsers, services }) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: client.full_name,
        email: client.email,
        phone: client.phone || '',
        company_name: client.company_name || '',
        status: client.status,
        assigned_staff_id: client.assigned_staff_id || '',
        services: client.services.map(s => ({
            id: s.id,
            status: s.pivot.status
        })),
    });

    const [selectedServices, setSelectedServices] = useState(
        client.services.map(s => s.id)
    );

    const handleServiceToggle = (serviceId) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });

        const updatedServices = selectedServices.includes(serviceId)
            ? data.services.filter(s => s.id !== serviceId)
            : [...data.services, { id: serviceId, status: 'Pending' }];
        
        setData('services', updatedServices);
    };

    const handleServiceStatusChange = (serviceId, status) => {
        const updatedServices = data.services.map(s => 
            s.id === serviceId ? { ...s, status } : s
        );
        setData('services', updatedServices);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('clients.update', client.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Client: {client.full_name}
                    </h2>
                    <Link
                        href={route('clients.index')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${client.full_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.full_name}
                                            onChange={e => setData('full_name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.full_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={e => setData('company_name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.company_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status *
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="Lead">Lead</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Assign to Staff
                                        </label>
                                        <select
                                            value={data.assigned_staff_id}
                                            onChange={e => setData('assigned_staff_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Unassigned</option>
                                            {staffUsers.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.assigned_staff_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.assigned_staff_id}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Services Assignment */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Services</h3>
                                    <div className="space-y-4">
                                        {services.map(service => (
                                            <div key={service.id} className="border rounded-lg p-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`service-${service.id}`}
                                                        checked={selectedServices.includes(service.id)}
                                                        onChange={() => handleServiceToggle(service.id)}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`service-${service.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                                        {service.name}
                                                    </label>
                                                </div>
                                                
                                                {selectedServices.includes(service.id) && (
                                                    <div className="mt-2 ml-7">
                                                        <label className="block text-sm text-gray-600">Status:</label>
                                                        <select
                                                            value={data.services.find(s => s.id === service.id)?.status || 'Pending'}
                                                            onChange={(e) => handleServiceStatusChange(service.id, e.target.value)}
                                                            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Client'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
    `           </div>
            </div>
        </AuthenticatedLayout>
    );
}