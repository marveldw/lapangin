<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
            ], 401);
        }

        $userRole = strtoupper($user->role ?? '');
        $allowedRoles = array_map('strtoupper', $roles);

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Fitur ini hanya dapat diakses oleh role: ' . implode(', ', $roles) . '.',
            ], 403);
        }

        return $next($request);
    }
}
