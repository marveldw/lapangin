<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Customer extends Model
{
    use LogsActivity, SoftDeletes;
    protected $primaryKey = 'customer_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Pelanggan '{$this->name}' telah di-{$eventName}");
    }

    protected $fillable = [
        'owner_id',
        'name',
        'phone',
        'email',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'user_id')->withTrashed();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id', 'customer_id');
    }
}
