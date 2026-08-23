<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourtOperatingHour extends Model
{
    protected $primaryKey = 'court_operating_hour_id';

    protected $fillable = [
        'court_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];
}
