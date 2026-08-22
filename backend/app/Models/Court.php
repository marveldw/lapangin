<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Court extends Model
{
    protected $primaryKey = 'court_id';

    protected $fillable = [
        'owner_id',
        'name',
        'sport_type',
        'description',
        'price_per_hour',
        'location',
        'image_url',
        'status',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'user_id');
    }
}