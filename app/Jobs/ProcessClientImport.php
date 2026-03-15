<?php
// app/Jobs/ProcessClientImport.php

namespace App\Jobs;

use App\Models\Import;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\QueuedClientsImport;
use Throwable;

class ProcessClientImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    protected $import;
    protected $path; // This is the full path from store()

    public $tries = 3;
    public $backoff = 3;

    public function __construct(Import $import, $path)
    {
        $this->import = $import;
        $this->path = $path;
    }

    public function handle(): void
    {
        try {
            $this->import->update(['status' => 'Processing']);

            // Files are stored in storage/app/private/ + the path
            $fullPath = storage_path('app/private/' . $this->path);
            
            Log::info('Looking for file', [
                'import_id' => $this->import->id,
                'path' => $this->path,
                'full_path' => $fullPath,
                'exists' => file_exists($fullPath) ? 'YES' : 'NO'
            ]);

            if (!file_exists($fullPath)) {
                throw new \Exception("File not found: " . $this->path);
            }

            // Process the file
            $importHandler = new QueuedClientsImport($this->import);
            Excel::import($importHandler, $fullPath);

            // Update with results
            $this->import->update([
                'status' => 'Completed',
                'imported_count' => $importHandler->getImportedCount(),
                'skipped_count' => $importHandler->getSkippedCount(),
            ]);

            // Delete file after successful import
            if (file_exists($fullPath)) {
                unlink($fullPath);
                Log::info('File deleted', ['import_id' => $this->import->id]);
            }

        } catch (Throwable $e) {
            $this->import->update([
                'status' => 'Failed',
                'error_message' => $e->getMessage()
            ]);

            Log::error('Import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}