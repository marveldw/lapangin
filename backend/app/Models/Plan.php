<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Plan extends Model
{
    use LogsActivity;

    public const FREE  = 'FREE';
    public const BASIC = 'BASIC';
    public const PRO   = 'PRO';

    public const COURT_LIMITS = [
        self::FREE  => 1,
        self::BASIC => 5,
        self::PRO   => null, // null = unlimited
    ];

    protected $primaryKey = 'plan_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Paket '{$this->name}' telah di-{$eventName}");
    }

    protected $fillable = [
        'name',
        'description',
        'price',
        'max_bookings_per_month',
        'max_courts',
        'is_active',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id', 'plan_id');
    }

    /**
     * Resolve maximum allowed courts for a plan name.
     * Returns null for unlimited (e.g. PRO), or integer quota (e.g. 1 for FREE, 5 for BASIC).
     */
    public static function getMaxCourtsForPlan(?string $planName): ?int
    {
        $name = strtoupper(trim($planName ?? self::FREE));

        if ($name === self::PRO) {
            return null;
        }

        $configPlans = config('plans.plans');
        if (is_array($configPlans) && array_key_exists($name, $configPlans)) {
            return $configPlans[$name]['max_courts'];
        }

        return self::COURT_LIMITS[$name] ?? self::COURT_LIMITS[self::FREE];
    }

    /**
     * Whether this plan allows unlimited courts.
     */
    public function isUnlimitedCourts(): bool
    {
        return $this->max_courts === null || strtoupper($this->name) === self::PRO;
    }
}
