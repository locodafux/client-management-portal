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

    public $tries = 5; // Increase retry attempts
    public $backoff = 3; // Wait 3 seconds between retries

    public function __construct(Import $import, $filePath)
    {
        $this->import = $import;
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        try {
            $this->import->update(['status' => 'Processing']);

            // Use Storage facade to check file
            $fullPath = Storage::disk('local')->path($this->filePath);
            
            Log::info('Job attempting to process file', [
                'import_id' => $this->import->id,
                'file_path' => $this->filePath,
                'full_path' => $fullPath,
                'disk_exists' => Storage::disk('local')->exists($this->filePath) ? 'YES' : 'NO',
                'file_exists' => file_exists($fullPath) ? 'YES' : 'NO'
            ]);

            // Try multiple times with delay (sometimes filesystem is slow)
            $attempts = 0;
            while (!Storage::disk('local')->exists($this->filePath) && $attempts < 5) {
                $attempts++;
                Log::warning("File not found, attempt {$attempts}/5, waiting...");
                sleep(1);
            }

            if (!Storage::disk('local')->exists($this->filePath)) {
                throw new \Exception("File not found after {$attempts} attempts: " . $this->filePath);
            }

            // Get the full path for Excel import
            $fullPath = Storage::disk('local')->path($this->filePath);
            
            $importHandler = new QueuedClientsImport($this->import);
            Excel::import($importHandler, $fullPath);

            $this->import->update([
                'status' => 'Completed',
                'imported_count' => $importHandler->getImportedCount(),
                'skipped_count' => $importHandler->getSkippedCount(),
            ]);

            // Optionally delete file after successful import
            Storage::disk('local')->delete($this->filePath);
            
            Log::info('Import completed successfully', [
                'import_id' => $this->import->id
            ]);

        } catch (\Exception $e) {
            $this->import->update([
                'status' => 'Failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'file_path' => $this->filePath,
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }
}