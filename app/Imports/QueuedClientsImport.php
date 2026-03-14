<?php
// app/Imports/QueuedClientsImport.php

namespace App\Imports;

use App\Models\Client;
use App\Models\User;
use App\Models\Import;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterImport;

class QueuedClientsImport implements 
    ToModel, 
    WithHeadingRow, 
    WithValidation, 
    SkipsOnFailure,
    WithChunkReading,
    ShouldQueue,
    WithEvents
{
    use SkipsFailures;

    private $import;
    private $importedCount = 0;
    private $skippedCount = 0;

    public function __construct(Import $import)
    {
        $this->import = $import;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Skip if email already exists
        if (Client::where('email', $row['email'])->exists()) {
            $this->skippedCount++;
            $this->updateCounts();
            return null;
        }

        $this->importedCount++;
        
        // Update counts every 10 rows
        if (($this->importedCount + $this->skippedCount) % 10 === 0) {
            $this->updateCounts();
        }

        return new Client([
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'phone' => $row['phone'] ?? null,
            'company_name' => $row['company_name'] ?? null,
            'status' => $row['status'] ?? 'Lead',
            'assigned_staff_id' => $this->getRandomStaffId(),
        ]);
    }

    /**
     * Update import progress
     */
    private function updateCounts()
    {
        $this->import->update([
            'imported_count' => $this->importedCount,
            'skipped_count' => $this->skippedCount,
        ]);
    }

    /**
     * Get a random staff user ID for assignment
     */
    private function getRandomStaffId()
    {
        $staff = User::where('role', 'staff')->inRandomOrder()->first();
        return $staff ? $staff->id : null;
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:Lead,Active,Inactive',
        ];
    }

    /**
     * @return int
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterImport::class => function(AfterImport $event) {
                // Final update
                $this->updateCounts();
            },
        ];
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }
}