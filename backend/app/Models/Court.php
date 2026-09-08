<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CourtOperatingHour;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Court extends Model
{
    use LogsActivity;

    protected $primaryKey = 'court_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Lapangan '{$this->name}' telah di-{$eventName}");
    }

    protected $fillable = [
        'owner_id',
        'name',
        'sport_type',
        'description',
        'price_per_hour',
        'address',
        'city',
        'district',
        'image_url',
        'status',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'user_id');
    }

    public function operatingHours()
    {
        return $this->hasMany(CourtOperatingHour::class, 'court_id', 'court_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'court_id', 'court_id');
    }
}