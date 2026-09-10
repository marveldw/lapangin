<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Regency extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'province_code',
        'province_name',
        'name',
        'alt_name',
        'type',
    ];

    public function districts()
    {
        return $this->hasMany(District::class, 'regency_id', 'id');
    }
}
