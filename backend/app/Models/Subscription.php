<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $primaryKey = 'subscription_id';

    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id', 'plan_id');
    }
}
