<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Booking extends Model
{
    use LogsActivity;

    protected $primaryKey = 'booking_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Booking #{$this->booking_code} telah di-{$eventName}");
    }

    protected $fillable = [
        'booking_code',
        'court_id',
        'customer_id',
        'user_id',
        'booking_date',
        'start_time',
        'end_time',
        'price',
        'payment_method',
        'status',
        'notes',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class, 'court_id', 'court_id')->withTrashed();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
