<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
       use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'company_name',
        'status',
        'assigned_staff_id',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationship with assigned staff user
    public function assignedStaff()
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    // Relationship with services (many-to-many)
    public function services()
    {
        return $this->belongsToMany(Service::class, 'client_service')
                    ->withPivot('status', 'created_at', 'updated_at')
                    ->withTimestamps();
    }

    // Scopes for filtering
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where('full_name', 'like', "%{$term}%")
                     ->orWhere('email', 'like', "%{$term}%");
    }
}
