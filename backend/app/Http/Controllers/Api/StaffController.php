<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\IndonesianPhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    /**
     * GET /api/owner/staff — List all staff members under the current owner.
     */
    public function index(Request $request)
    {
        $owner = $request->user();

        $staff = User::where('owner_id', $owner->user_id)
            ->where('role', 'STAFF')
            ->select(['user_id', 'name', 'email', 'phone', 'role', 'status', 'created_at'])
            ->latest('user_id')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $staff,
        ]);
    }

    /**
     * POST /api/owner/staff — Create a new staff sub-account under the current owner.
     */
    public function store(Request $request)
    {
        $owner = $request->user();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone'    => [
                'required',
                'string',
                Rule::unique('users', 'phone'),
                new IndonesianPhoneNumber(),
            ],
        ], [
            'email.unique'   => 'Email ini sudah terdaftar pada akun lain.',
            'phone.required' => 'Nomor telepon staf wajib diisi.',
            'phone.unique'   => 'Nomor telepon ini sudah terdaftar pada akun lain.',
        ]);

        $staff = User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'phone'         => $validated['phone'],
            'role'          => 'STAFF',
            'owner_id'      => $owner->user_id,
            'status'        => 'ACTIVE',
        ]);

        activity()
            ->causedBy($owner)
            ->performedOn($staff)
            ->withProperties([
                'staff_name'  => $staff->name,
                'staff_email' => $staff->email,
            ])
            ->log("Staf '{$staff->name}' ditambahkan oleh {$owner->name}");

        return response()->json([
            'success' => true,
            'message' => 'Akun staf berhasil dibuat.',
            'data'    => [
                'user_id'    => $staff->user_id,
                'name'       => $staff->name,
                'email'      => $staff->email,
                'phone'      => $staff->phone,
                'role'       => $staff->role,
                'status'     => $staff->status,
                'created_at' => $staff->created_at,
            ],
        ], 201);
    }

    /**
     * PUT /api/owner/staff/{id} — Update staff details or toggle status.
     */
    public function update(Request $request, int $id)
    {
        $owner = $request->user();

        $staff = User::where('owner_id', $owner->user_id)
            ->where('role', 'STAFF')
            ->findOrFail($id);

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignoreModel($staff),
            ],
            'phone'    => [
                'sometimes',
                'required',
                'string',
                Rule::unique('users', 'phone')->ignoreModel($staff),
                new IndonesianPhoneNumber(),
            ],
            'status'   => ['sometimes', 'required', Rule::in(['ACTIVE', 'INACTIVE'])],
            'password' => 'sometimes|nullable|string|min:8',
        ], [
            'email.unique'   => 'Email ini sudah terdaftar pada akun lain.',
            'phone.required' => 'Nomor telepon staf wajib diisi.',
            'phone.unique'   => 'Nomor telepon ini sudah terdaftar pada akun lain.',
        ]);

        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password_hash'] = Hash::make($validated['password']);
            unset($validated['password']);
        }

        if (array_key_exists('phone', $validated)) {
            $validated['phone'] = !empty($validated['phone']) ? $validated['phone'] : null;
        }

        $staff->update($validated);

        activity()
            ->causedBy($owner)
            ->performedOn($staff)
            ->log("Data staf '{$staff->name}' diperbarui oleh {$owner->name}");

        return response()->json([
            'success' => true,
            'message' => 'Data staf berhasil diperbarui.',
            'data'    => [
                'user_id' => $staff->user_id,
                'name'    => $staff->name,
                'email'   => $staff->email,
                'phone'   => $staff->phone,
                'role'    => $staff->role,
                'status'  => $staff->status,
            ],
        ]);
    }

    /**
     * DELETE /api/owner/staff/{id} — Deactivate/remove a staff account.
     */
    public function destroy(Request $request, int $id)
    {
        $owner = $request->user();

        $staff = User::where('owner_id', $owner->user_id)
            ->where('role', 'STAFF')
            ->findOrFail($id);

        $staffName = $staff->name;

        // Set status to INACTIVE so audit log & historical bookings are fully preserved
        $staff->update(['status' => 'INACTIVE']);

        activity()
            ->causedBy($owner)
            ->performedOn($staff)
            ->log("Staf '{$staffName}' dinonaktifkan oleh {$owner->name}");

        return response()->json([
            'success' => true,
            'message' => "Akun staf '{$staffName}' berhasil dinonaktifkan.",
        ]);
    }
}
