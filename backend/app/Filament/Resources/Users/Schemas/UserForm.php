<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Rules\IndonesianPhoneNumber;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Hash;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('password_hash')
                    ->label('Password')
                    ->password()
                    ->dehydrateStateUsing(fn (?string $state) => filled($state) ? Hash::make($state) : null)
                    ->dehydrated(fn (?string $state) => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create'),
                TextInput::make('phone')
                    ->tel()
                    ->unique('users', 'phone', ignoreRecord: true)
                    ->rules([new IndonesianPhoneNumber()])
                    ->validationMessages([
                        'unique' => 'Nomor telepon ini sudah terdaftar pada akun lain.',
                    ]),
                TextInput::make('role')
                    ->required()
                    ->default('OWNER'),
                TextInput::make('status')
                    ->required()
                    ->default('ACTIVE'),
            ]);
    }
}
