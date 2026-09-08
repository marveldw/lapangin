<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Plan extends Model
{
    use LogsActivity;

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
}
