<?php

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
    protected $filePath;

    public $tries = 5;
    public $backoff = 3;
    public $timeout = 300;

    public function __construct(Import $import, $filePath)
    {
        $this->import = $import;
        $this->filePath = $filePath;
    }

    public function handle(): void
    {
        try {
            $this->updateStatus('Processing');

            $fullPath = $this->getFilePath();
            
            if (!$fullPath || !file_exists($fullPath)) {
                throw new \Exception("File not found: " . $this->filePath);
            }

            Log::info('Processing import', [
                'import_id' => $this->import->id,
                'file' => $fullPath
            ]);

            $importHandler = new QueuedClientsImport($this->import);
            Excel::import($importHandler, $fullPath);

            $this->updateStatus('Completed', [
                'imported_count' => $importHandler->getImportedCount(),
                'skipped_count' => $importHandler->getSkippedCount(),
            ]);

            if (file_exists($fullPath)) {
                unlink($fullPath);
                Log::info('File deleted after import', ['import_id' => $this->import->id]);
            }

        } catch (Throwable $e) {
            $this->updateStatus('Failed', [
                'error_message' => $e->getMessage()
            ]);

            Log::error('Import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        $this->updateStatus('Failed', [
            'error_message' => 'Max retries exceeded: ' . $e->getMessage()
        ]);

        Log::error('Import failed permanently', [
            'import_id' => $this->import->id,
            'error' => $e->getMessage()
        ]);
    }

    private function updateStatus(string $status, array $extra = []): void
    {
        try {
            $this->import->update(array_merge(['status' => $status], $extra));
        } catch (Throwable $e) {
            Log::error('Failed to update import status', [
                'import_id' => $this->import->id,
                'status' => $status,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function getFilePath(): ?string
    {
        $fullPath = storage_path('app/private/' . $this->filePath);
        
        if (file_exists($fullPath)) {
            return $fullPath;
        }
        
        $altPath = storage_path('app/' . $this->filePath);
        if (file_exists($altPath)) {
            return $altPath;
        }
        
        return null;
    }
}