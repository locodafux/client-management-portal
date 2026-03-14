<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use Inertia\Inertia;


class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index()
    {
        $services = Service::orderBy('name')->paginate(10);
        
        return Inertia::render('Services/Index', [
            'services' => $services
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create()
    {
        return Inertia::render('Services/Create');
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:services',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Service::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('services.index')
            ->with('success', 'Service created successfully.');
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        return Inertia::render('Services/Edit', [
            'service' => $service
        ]);
    }

    /**
     * Update the specified service in storage.
     */
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:services,name,' . $service->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $service->update([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('services.index')
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Toggle service active status
     */
    public function toggleActive(Service $service)
    {
        $service->update([
            'is_active' => !$service->is_active
        ]);

        $status = $service->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Service {$status} successfully.");
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service)
    {
        // Check if service is assigned to any clients
        if ($service->clients()->exists()) {
            return back()->with('error', 'Cannot delete service that is assigned to clients.');
        }

        $service->delete();

        return redirect()->route('services.index')
            ->with('success', 'Service deleted successfully.');
    }
}
