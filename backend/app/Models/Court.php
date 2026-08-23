<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\CourtOperatingHour;

class Court extends Model
{
    protected $primaryKey = 'court_id';

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