<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'booking_code',
        'court_id',
        'customer_id',
        'user_id',
        'booking_date',
        'start_time',
        'end_time',
        'price',
        'status',
        'notes',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class, 'court_id', 'court_id');
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
