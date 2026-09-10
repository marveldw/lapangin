<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Withdrawal extends Model
{
    use LogsActivity;

    protected $primaryKey = 'withdrawal_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Pengajuan Tarik Dana #{$this->withdrawal_code} telah di-{$eventName}");
    }

    protected $fillable = [
        'withdrawal_code',
        'wallet_id',
        'amount',
        'bank_name',
        'account_number',
        'account_holder',
        'status',
        'proof_url',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class, 'wallet_id', 'wallet_id');
    }
}
