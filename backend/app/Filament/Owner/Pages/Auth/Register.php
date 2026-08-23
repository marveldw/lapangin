<?php

namespace App\Filament\Owner\Pages\Auth;

use App\Models\Plan;
use App\Models\Subscription;
use Filament\Auth\Pages\Register as BaseRegister;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Register extends BaseRegister
{
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getNameFormComponent(),
                $this->getEmailFormComponent(),
                TextInput::make('phone')
                    ->label('Nomor WhatsApp / HP')
                    ->tel()
                    ->required()
                    ->maxLength(20),
                $this->getPasswordFormComponent(),
                $this->getPasswordConfirmationFormComponent(),
            ]);
    }

    protected function mutateFormDataBeforeRegister(array $data): array
    {
        $data['role'] = 'OWNER';
        $data['status'] = 'ACTIVE';
        $data['password_hash'] = Hash::make($data['password']);
        unset($data['password']);

        return $data;
    }

    protected function handleRegistration(array $data): Model
    {
        $user = $this->getUserModel()::create($data);

        // Auto assign default FREE plan
        $freePlan = Plan::firstOrCreate(
            ['name' => 'FREE'],
            [
                'description'            => 'Paket Percobaan',
                'price'                  => 0,
                'max_courts'             => 1,
                'max_bookings_per_month' => 30,
                'is_active'              => true,
            ]
        );

        Subscription::create([
            'user_id'    => $user->user_id,
            'plan_id'    => $freePlan->plan_id,
            'start_date' => now(),
            'status'     => 'ACTIVE',
        ]);

        return $user;
    }
}
