<?php

namespace App\Imports;

use App\Models\Client;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\Importable;
use Illuminate\Validation\Rule;

class ClientsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    private $importedCount = 0;
    private $skippedCount = 0;

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
            return null;
        }

        $this->importedCount++;

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
     * @return array
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    /**
     * @return array
     */
    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }
}