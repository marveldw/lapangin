<?php

namespace App\Http\Responses;

use Filament\Auth\Http\Responses\Contracts\LoginResponse as Responsable;
use Illuminate\Http\RedirectResponse;
use Livewire\Features\SupportRedirects\Redirector;

class FilamentLoginResponse implements Responsable
{
    public function toResponse($request): RedirectResponse | Redirector
    {
        $user = auth()->user();

        if ($user?->role === 'ADMIN') {
            return redirect()->to('/admin');
        }

        if ($user?->role === 'OWNER') {
            return redirect()->to('/owner');
        }

        return redirect()->to('/');
    }
}
