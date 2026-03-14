import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Import() {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            
            // Check file type
            const validTypes = ['.csv', '.xlsx', '.xls'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!validTypes.includes(fileExtension)) {
                alert('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
                return;
            }
            
            setFileName(file.name);
            setData('file', file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('clients.import.store'), {
            preserveState: false, 
            onSuccess: () => {
                // Form is reset automatically by Inertia
                // The controller redirects to clients.index with flash message
                // No need to do anything here
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            },
        });
    };

    const downloadTemplate = () => {
        window.location.href = route('clients.import.template');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Import Clients
                    </h2>
                    <Link
                        href={route('clients.index')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Back to Clients
                    </Link>
                </div>
            }
        >
            <Head title="Import Clients" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Import Form */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Instructions */}
                            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Import Instructions</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Download the template CSV file first</li>
                                                <li>Required columns: <span className="font-mono">full_name, email</span></li>
                                                <li>Optional columns: <span className="font-mono">phone, company_name, status</span> (Lead/Active/Inactive)</li>
                                                <li>Duplicate emails will be skipped automatically</li>
                                                <li>Invalid rows will be skipped silently</li>
                                                <li>Maximum file size: <strong>10MB</strong></li>
                                                <li>Supported formats: <strong>CSV, XLSX, XLS</strong></li>
                                                <li>After uploading, you'll be redirected to the client list</li>
                                                <li>Click "Show Imports" to track progress</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Download Template Button */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Template CSV
                                </button>
                            </div>

                            {/* Upload Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                                    <div className="text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="mt-4 flex justify-center text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Click to upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".csv,.xlsx,.xls"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            CSV, XLSX, or XLS up to 10MB
                                        </p>
                                    </div>

                                    {fileName && (
                                        <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm text-center">
                                            <span className="font-medium">Selected file:</span> {fileName}
                                        </div>
                                    )}

                                    {errors.file && (
                                        <div className="mt-2 text-sm text-red-600 text-center">
                                            {errors.file}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('clients.index')}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={!data.file || processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {processing ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </span>
                                        ) : 'Upload & Process'}
                                    </button>
                                </div>
                            </form>

                            {/* Note about redirect */}
                            <div className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
                                <p>After uploading, you'll be redirected to the client list where you can track import progress.</p>
                                <p className="text-xs text-gray-400 mt-1">Look for the "Show Imports" button to view status.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}