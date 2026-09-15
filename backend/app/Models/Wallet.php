<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Wallet extends Model
{
    use LogsActivity;

    protected $primaryKey = 'wallet_id';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Dompet Owner #{$this->owner_id} telah di-{$eventName}");
    }

    protected $fillable = [
        'owner_id',
        'balance',
        'locked_balance',
        'bank_name',
        'account_number',
        'account_holder',
    ];

    protected $casts = [
        'balance'        => 'integer',
        'locked_balance' => 'integer',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id', 'user_id');
    }

    public function mutations()
    {
        return $this->hasMany(WalletMutation::class, 'wallet_id', 'wallet_id')->orderBy('mutation_id', 'desc');
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class, 'wallet_id', 'wallet_id')->orderBy('withdrawal_id', 'desc');
    }
}
