<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = Client::with(['assignedStaff', 'services']);

        // Search functionality
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->status($request->status);
        }

        $clients = $query->orderBy('created_at', 'desc')
                        ->paginate(10)
                        ->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show form for creating new client.
     */
    public function create()
    {
        $staffUsers = User::where('role', 'staff')->get(['id', 'name']);
        $services = Service::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Clients/Create', [
            'staffUsers' => $staffUsers,
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'status' => 'required|in:Lead,Active,Inactive',
            'assigned_staff_id' => 'nullable|exists:users,id',
            'services' => 'array',
            'services.*.id' => 'exists:services,id',
            'services.*.status' => 'in:Pending,In Progress,Completed',
        ]);

        $client = Client::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company_name' => $request->company_name,
            'status' => $request->status,
            'assigned_staff_id' => $request->assigned_staff_id,
        ]);

        // Assign services
        if ($request->has('services')) {
            foreach ($request->services as $service) {
                $client->services()->attach($service['id'], [
                    'status' => $service['status'] ?? 'Pending',
                ]);
            }
        }

        return redirect()->route('clients.index')
            ->with('success', 'Client created successfully.');
    }

    /**
     * Show form for editing client.
     */
    public function edit(Client $client)
    {
        $client->load(['assignedStaff', 'services']);

        $staffUsers = User::where('role', 'staff')->get(['id', 'name']);
        $services = Service::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'staffUsers' => $staffUsers,
            'services' => $services,
        ]);
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'status' => 'required|in:Lead,Active,Inactive',
            'assigned_staff_id' => 'nullable|exists:users,id',
            'services' => 'array',
            'services.*.id' => 'exists:services,id',
            'services.*.status' => 'in:Pending,In Progress,Completed',
        ]);

        $client->update([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company_name' => $request->company_name,
            'status' => $request->status,
            'assigned_staff_id' => $request->assigned_staff_id,
        ]);

        // Sync services
        $servicesToSync = [];
        foreach ($request->services ?? [] as $service) {
            $servicesToSync[$service['id']] = ['status' => $service['status'] ?? 'Pending'];
        }
        $client->services()->sync($servicesToSync);

        return redirect()->route('clients.index')
            ->with('success', 'Client updated successfully.');
    }

    /**
     * Remove the specified client.
     */
    public function destroy(Client $client)
    {
        // Check if user has permission (Admin/Manager only)
        if (!in_array(auth()->user()->role, ['admin', 'manager'])) {
            return back()->with('error', 'Unauthorized to delete clients.');
        }

        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client deleted successfully.');
    }

    /**
     * Update client service status
     */
    public function updateServiceStatus(Request $request, Client $client, Service $service)
    {
        $request->validate([
            'status' => 'required|in:Pending,In Progress,Completed',
        ]);

        $client->services()->updateExistingPivot($service->id, [
            'status' => $request->status,
        ]);

        return back()->with('success', 'Service status updated.');
    }
}