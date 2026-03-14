// resources/js/Pages/Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    const user = auth.user;
    
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'manager':
                return 'bg-yellow-100 text-yellow-800';
            case 'staff':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Welcome, {user.name}!</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    You are logged in as: 
                                    <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleBadgeColor(user.role)}`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-medium">Your Permissions:</h4>
                                <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                    {user.role === 'admin' && (
                                        <>
                                            <li>✓ Full access to User Management</li>
                                            <li>✓ Full access to Services Management</li>
                                            <li>✓ Full access to Client Management</li>
                                            <li>✓ Can import clients</li>
                                        </>
                                    )}
                                    
                                    {user.role === 'manager' && (
                                        <>
                                            <li>✗ No access to User Management</li>
                                            <li>✓ Full access to Services Management</li>
                                            <li>✓ Full access to Client Management</li>
                                            <li>✓ Can import clients</li>
                                        </>
                                    )}
                                    
                                    {user.role === 'staff' && (
                                        <>
                                            <li>✗ No access to User Management</li>
                                            <li>✗ No access to Services Management</li>
                                            <li>✓ View-only access to Clients</li>
                                            <li>✗ Cannot import clients</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Quick Actions based on role */}
                            <div className="mt-8">
                                <h4 className="font-medium">Quick Actions:</h4>
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {user.role !== 'staff' && (
                                        <Link
                                            href="#"
                                            className="block p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100"
                                        >
                                            <h5 className="font-medium text-blue-800">Add New Client</h5>
                                            <p className="text-sm text-blue-600">Create a new client record</p>
                                        </Link>
                                    )}
                                    
                                    {user.role === 'admin' && (
                                        <Link
                                            href={route('users.index')}
                                            className="block p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100"
                                        >
                                            <h5 className="font-medium text-purple-800">Manage Users</h5>
                                            <p className="text-sm text-purple-600">Add or edit system users</p>
                                        </Link>
                                    )}
                                    
                                    {(user.role === 'admin' || user.role === 'manager') && (
                                        <Link
                                            href="#"
                                            className="block p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100"
                                        >
                                            <h5 className="font-medium text-green-800">Manage Services</h5>
                                            <p className="text-sm text-green-600">Add or edit services</p>
                                        </Link>
                                    )}
                                    
                                    <Link
                                        href="#"
                                        className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
                                    >
                                        <h5 className="font-medium text-gray-800">View Clients</h5>
                                        <p className="text-sm text-gray-600">Browse all clients</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}