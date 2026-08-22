<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $primaryKey = 'plan_id';

    protected $fillable = [
        'name',
        'description',
        'price',
        'max_bookings_per_month',
        'max_courts',
        'is_active',
    ];
}
