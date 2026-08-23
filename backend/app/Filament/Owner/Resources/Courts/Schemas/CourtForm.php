<?php

namespace App\Filament\Owner\Resources\Courts\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class CourtForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('owner_id')
                    ->required()
                    ->numeric(),
                TextInput::make('name')
                    ->required(),
                TextInput::make('sport_type')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('price_per_hour')
                    ->required()
                    ->numeric(),
                TextInput::make('address')
                    ->required(),
                FileUpload::make('image_url')
                    ->image(),
                TextInput::make('status')
                    ->required()
                    ->default('ACTIVE'),
                TextInput::make('city')
                    ->required(),
                TextInput::make('district'),
            ]);
    }
}
