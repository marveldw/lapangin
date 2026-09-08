<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class User extends Authenticatable implements FilamentUser
{
    use HasRoles;
    use HasApiTokens, HasFactory, Notifiable, LogsActivity;

    protected $primaryKey = 'user_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'role', 'status'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Pengguna '{$this->name}' ({$this->role}) telah di-{$eventName}");
    }

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'phone',
        'role',
        'status',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Determine if the user can access a specific Filament panel.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        if ($this->status !== 'ACTIVE') {
            return false;
        }

        if ($panel->getId() === 'owner') {
            return $this->role === 'OWNER' || $this->role === 'ADMIN';
        }

        if ($panel->getId() === 'admin') {
            return $this->role === 'ADMIN';
        }

        return false;
    }

    public function courts()
    {
        return $this->hasMany(Court::class, 'owner_id', 'user_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'user_id', 'user_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'user_id', 'user_id');
    }
}