<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Rules\IndonesianPhoneNumber;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // GET /api/customers
    public function index(Request $request)
    {
        $customers = Customer::where('owner_id', $request->user()->getTenantOwnerId())
            ->withCount('bookings')
            ->latest('customer_id')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $customers,
        ]);
    }

    // POST /api/customers — manually create customer
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => ['required', 'string', new IndonesianPhoneNumber()],
            'email' => 'nullable|email|max:255',
        ]);

        $customer = Customer::create([
            ...$validated,
            'owner_id' => $request->user()->getTenantOwnerId(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $customer,
        ], 201);
    }

    // GET /api/customers/{id}
    public function show(Request $request, $id)
    {
        $customer = Customer::where('customer_id', $id)
            ->where('owner_id', $request->user()->getTenantOwnerId())
            ->with(['bookings' => function ($query) {
                $query->with('court')->latest('booking_date')->limit(50);
            }])
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $customer,
        ]);
    }

    // PUT /api/customers/{id}
    public function update(Request $request, $id)
    {
        $customer = Customer::where('customer_id', $id)
            ->where('owner_id', $request->user()->getTenantOwnerId())
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => ['sometimes', 'required', 'string', new IndonesianPhoneNumber()],
            'email' => 'nullable|email|max:255',
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $customer,
        ]);
    }
}
