<?php

namespace App\Http\Controllers;

use App\Imports\QueuedClientsImport;
use App\Jobs\ProcessClientImport;
use App\Models\Import;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class ClientImportController extends Controller
{
    /**
     * Show import form with recent imports
     */
    public function create()
    {
        $recentImports = Import::where('started_by', auth()->id())
                               ->orderBy('created_at', 'desc')
                               ->limit(5)
                               ->get()
                               ->map(function ($import) {
                                   return [
                                       'id' => $import->id,
                                       'filename' => $import->filename,
                                       'status' => $import->status,
                                       'imported_count' => $import->imported_count,
                                       'skipped_count' => $import->skipped_count,
                                       'error_message' => $import->error_message,
                                       'created_at' => $import->created_at->diffForHumans(),
                                   ];
                               });

        return Inertia::render('Clients/Import', [
            'recentImports' => $recentImports
        ]);
    }

    /**
     * Process the import asynchronously
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        // Store the file
        $file = $request->file('file');
        $path = $file->store('imports', 'local');

        // Create import record
        $import = Import::create([
            'started_by' => auth()->id(),
            'filename' => $file->getClientOriginalName(),
            'status' => 'Queued',
        ]);

        // Dispatch job to process file
        ProcessClientImport::dispatch($import, $path);

        // IMPORTANT: Redirect back to Client List with flash message
        // NOT to the import page
        return redirect()->route('clients.index')
            ->with('success', 'Import started.');
    }   

 public function recent(Request $request)
{
    $imports = Import::where('started_by', auth()->id())
                     ->orderBy('created_at', 'desc')
                     ->limit(5)
                     ->get()
                     ->map(function ($import) {
                         return [
                             'id' => $import->id,
                             'filename' => $import->filename,
                             'status' => $import->status,
                             'imported_count' => $import->imported_count,
                             'skipped_count' => $import->skipped_count,
                             'error_message' => $import->error_message,
                             'created_at' => $import->created_at->diffForHumans(),
                         ];
                     });

    // Always return Inertia response for Inertia requests
    return Inertia::render('Clients/Index', [
        'recentImports' => $imports
    ]);
}

    /**
     * Get specific import status
     */
    public function status(Request $request, Import $import)
    {
        if ($import->started_by !== auth()->id()) {
            abort(403, 'Unauthorized to view this import');
        }

        $data = [
            'id' => $import->id,
            'status' => $import->status,
            'imported_count' => $import->imported_count,
            'skipped_count' => $import->skipped_count,
            'error_message' => $import->error_message,
            'created_at' => $import->created_at->diffForHumans(),
            'updated_at' => $import->updated_at->diffForHumans(),
        ];

        if ($request->header('X-Inertia')) {
            return Inertia::render('Clients/Import', [
                'importStatus' => $data
            ]);
        }

        return response()->json($data);
    }

    /**
     * Download template file
     */
    public function downloadTemplate()
    {
        $headers = [
            'full_name',
            'email',
            'phone',
            'company_name',
            'status',
        ];

        $sampleData = [
            ['John Smith', 'john.smith@example.com', '+1-555-0101', 'Acme Corporation', 'Lead'],
            ['Sarah Johnson', 'sarah.j@example.com', '+1-555-0102', 'Tech Solutions Inc', 'Active'],
            ['Michael Brown', 'michael.b@example.com', '+1-555-0103', 'Global Services', 'Active'],
            ['Emily Davis', 'emily.d@example.com', '+1-555-0104', 'Creative Agency', 'Lead'],
            ['David Wilson', 'david.w@example.com', '+1-555-0105', 'Manufacturing Co', 'Inactive'],
            ['Lisa Anderson', 'lisa.a@example.com', '+1-555-0106', 'Digital Marketing Pros', 'Active'],
            ['Robert Taylor', 'robert.t@example.com', '+1-555-0107', 'IT Consulting Group', 'Lead'],
            ['Jennifer Martinez', 'jennifer.m@example.com', '+1-555-0108', 'Healthcare Plus', 'Active'],
            ['William Thompson', 'william.t@example.com', '+1-555-0109', 'Financial Services LLC', 'Inactive'],
            ['Maria Garcia', 'maria.g@example.com', '+1-555-0110', 'Education First', 'Lead'],
        ];

        $callback = function() use ($headers, $sampleData) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, $headers);
            
            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="client_import_template.csv"',
        ]);
    }

    /**
     * Cancel a queued import
     */
    public function cancel(Request $request, Import $import)
    {
        if ($import->started_by !== auth()->id()) {
            abort(403, 'Unauthorized to cancel this import');
        }

        if ($import->status !== 'Queued') {
            return back()->with('error', 'Only queued imports can be cancelled.');
        }

        $import->update([
            'status' => 'Failed',
            'error_message' => 'Cancelled by user'
        ]);

        return back()->with('success', 'Import cancelled successfully.');
    }

    /**
     * Retry a failed import
     */
    public function retry(Request $request, Import $import)
    {
        // Check if user owns this import
        if ($import->started_by !== auth()->id()) {
            abort(403, 'Unauthorized to retry this import');
        }

        // Only allow retry if failed
        if ($import->status !== 'Failed') {
            return back()->with('error', 'Only failed imports can be retried.');
        }

        // Reset the import
        $import->update([
            'status' => 'Queued',
            'imported_count' => 0,
            'skipped_count' => 0,
            'error_message' => null,
        ]);

        // Need to know the original file path - this would need to be stored
        // For now, this is a placeholder
        return back()->with('error', 'Retry functionality requires storing original files.');
    }
}