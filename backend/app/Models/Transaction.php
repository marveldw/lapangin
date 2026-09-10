<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Transaction extends Model
{
    use LogsActivity;

    protected $primaryKey = 'transaction_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Transaksi #{$this->order_id} telah di-{$eventName}");
    }

    protected $fillable = [
        'order_id',
        'user_id',
        'type',
        'reference_id',
        'gross_amount',
        'status',
        'payment_type',
        'qr_url',
        'qr_string',
        'expires_at',
        'payload_response',
    ];

    protected $casts = [
        'gross_amount'     => 'integer',
        'expires_at'       => 'datetime',
        'payload_response' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'reference_id', 'booking_id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'reference_id', 'plan_id');
    }
}
