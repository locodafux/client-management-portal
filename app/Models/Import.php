<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Import extends Model
{
    use HasFactory;

    protected $fillable = [
        'started_by',
        'filename',
        'status',
        'imported_count',
        'skipped_count',
        'error_message',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function startedBy()
    {
        return $this->belongsTo(User::class, 'started_by');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('started_by', $userId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc')->limit(5);
    }
}