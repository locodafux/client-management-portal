<?php

namespace App\Http\Controllers;

use App\Imports\ClientsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class ClientImportController extends Controller
{
    /**
     * Show import form
     */
    public function create()
    {
        return inertia('Clients/Import');
    }

    /**
     * Process the import
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // max 10MB
        ]);

        try {
            $import = new ClientsImport();
            Excel::import($import, $request->file('file'));

            return redirect()->route('clients.index')
                ->with('success', sprintf(
                    'Import completed: %d records imported, %d records skipped.',
                    $import->getImportedCount(),
                    $import->getSkippedCount()
                ));

        } catch (ValidationException $e) {
            $failures = $e->failures();
            
            $errorMessages = [];
            foreach ($failures as $failure) {
                $errorMessages[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }

            return back()->with('error', 'Import failed: ' . implode('; ', array_slice($errorMessages, 0, 5)));
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
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
        ['James Rodriguez', 'james.r@example.com', '+1-555-0111', 'Retail Solutions', 'Active'],
        ['Patricia Williams', 'patricia.w@example.com', '+1-555-0112', 'Construction Corp', 'Lead'],
        ['Thomas Lee', 'thomas.l@example.com', '+1-555-0113', 'Logistics Express', 'Active'],
        ['Barbara White', 'barbara.w@example.com', '+1-555-0114', 'Energy Solutions', 'Inactive'],
        ['Christopher Hall', 'christopher.h@example.com', '+1-555-0115', 'Food Industry Inc', 'Lead'],
         ];
        $callback = function() use ($headers, $sampleData) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, $headers);
            
            // Add sample data
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
}