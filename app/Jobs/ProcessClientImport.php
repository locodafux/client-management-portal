<?php
// app/Jobs/ProcessClientImport.php

namespace App\Jobs;

use App\Models\Import;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\QueuedClientsImport;

class ProcessClientImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    protected $import;
    protected $filePath;

    public $tries = 5;
    public $backoff = 3;

    public function __construct(Import $import, $filePath)
    {
        $this->import = $import;
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        try {
            $this->import->update(['status' => 'Processing']);

            // Check if file exists with multiple attempts
            $fullPath = $this->waitForFile();
            
            if (!$fullPath) {
                throw new \Exception("File not found after multiple attempts: " . $this->filePath);
            }

            Log::info('Processing import file', [
                'import_id' => $this->import->id,
                'file_path' => $fullPath,
                'file_size' => filesize($fullPath)
            ]);

            // Process the file
            $importHandler = new QueuedClientsImport($this->import);
            Excel::import($importHandler, $fullPath);

            // Update with results
            $this->import->update([
                'status' => 'Completed',
                'imported_count' => $importHandler->getImportedCount(),
                'skipped_count' => $importHandler->getSkippedCount(),
            ]);

            // Clean up file
            Storage::disk('local')->delete($this->filePath);
            
            Log::info('Import completed', [
                'import_id' => $this->import->id,
                'imported' => $importHandler->getImportedCount(),
                'skipped' => $importHandler->getSkippedCount()
            ]);

        } catch (\Exception $e) {
            $this->import->update([
                'status' => 'Failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'file_path' => $this->filePath
            ]);

            throw $e;
        }
    }

    /**
     * Wait for file to be available (handles slow filesystems)
     */
    private function waitForFile()
    {
        $attempts = 0;
        $maxAttempts = 10;
        
        while ($attempts < $maxAttempts) {
            if (Storage::disk('local')->exists($this->filePath)) {
                return Storage::disk('local')->path($this->filePath);
            }
            
            $attempts++;
            Log::warning("Waiting for file, attempt {$attempts}/{$maxAttempts}");
            sleep(2); // Wait 2 seconds between checks
        }
        
        return null;
    }
}