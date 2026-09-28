<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class User extends Authenticatable implements FilamentUser
{
    use HasRoles, SoftDeletes;
    use HasApiTokens, HasFactory, Notifiable, LogsActivity;

    protected static function booted(): void
    {
        static::deleted(function (User $user) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
        });
    }

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
        'owner_id',
        'status',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
        ];
    }

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

    public function parentOwner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'user_id')->withTrashed();
    }
    public function staffMembers()
    {
        return $this->hasMany(User::class, 'owner_id', 'user_id');
    }

    /**
     * Get the tenant owner ID for multi-tenant query scoping.
     * If user is a STAFF/ADMIN sub-account, returns their parent owner ID.
     * Otherwise returns their own user_id.
     */
    public function getTenantOwnerId(): int
    {
        return ($this->role === 'STAFF' && $this->owner_id) ? (int) $this->owner_id : (int) $this->user_id;
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

    public function wallet()
    {
        return $this->hasOne(Wallet::class, 'owner_id', 'user_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id', 'user_id');
    }

    /**
     * Get user's active subscription (most recent).
     */
    public function getActiveSubscriptionAttribute(): ?Subscription
    {
        if ($this->role === 'STAFF' && $this->owner_id) {
            return $this->parentOwner()->first()?->active_subscription;
        }

        return $this->subscriptions()
            ->where('status', 'ACTIVE')
            ->latest('subscription_id')
            ->first();
    }

    /**
     * Get user's active plan.
     */
    public function getActivePlanAttribute(): ?Plan
    {
        $subscription = $this->active_subscription;
        if ($subscription && $subscription->relationLoaded('plan')) {
            return $subscription->plan;
        }

        return $subscription?->plan()->first();
    }

    /**
     * Get maximum courts allowed based on active plan.
     * Returns null for unlimited (PRO), or integer quota (e.g. 1 for FREE, 5 for BASIC).
     */
    public function getMaxCourtsAllowed(): ?int
    {
        $plan = $this->active_plan;
        if ($plan) {
            if (strtoupper($plan->name) === Plan::PRO || $plan->max_courts === null) {
                return null;
            }
            return (int) $plan->max_courts;
        }

        return Plan::getMaxCourtsForPlan(Plan::FREE);
    }
}