<?php

namespace App\Filament\Owner\Resources\Courts\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class CourtForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Nama Lapangan')
                    ->placeholder('Contoh: Lapangan Futsal Vinyl 1')
                    ->required()
                    ->maxLength(255),

                Select::make('sport_type')
                    ->label('Cabang Olahraga')
                    ->options([
                        'Futsal'      => 'Futsal',
                        'Badminton'   => 'Badminton',
                        'Basketball'  => 'Basketball',
                        'Mini Soccer' => 'Mini Soccer',
                        'Tennis'      => 'Tennis',
                        'Volleyball'  => 'Volleyball',
                        'Padel'       => 'Padel',
                        'Tenis Meja'  => 'Tenis Meja',
                    ])
                    ->searchable()
                    ->required(),

                TextInput::make('price_per_hour')
                    ->label('Tarif per Jam')
                    ->prefix('Rp')
                    ->placeholder('150000')
                    ->numeric()
                    ->required(),

                Select::make('status')
                    ->label('Status Lapangan')
                    ->options([
                        'ACTIVE'   => 'Aktif (Dapat Dipesan)',
                        'INACTIVE' => 'Nonaktif (Perbaikan / Tutup)',
                    ])
                    ->default('ACTIVE')
                    ->required(),

                TextInput::make('city')
                    ->label('Kota / Kabupaten')
                    ->placeholder('Contoh: Bandung')
                    ->required()
                    ->maxLength(100),

                TextInput::make('district')
                    ->label('Kecamatan')
                    ->placeholder('Contoh: Coblong')
                    ->maxLength(100),

                TextInput::make('address')
                    ->label('Alamat Lengkap Venue')
                    ->placeholder('Contoh: Jl. Cisitu Indah No. 10')
                    ->required()
                    ->columnSpanFull(),

                Textarea::make('description')
                    ->label('Deskripsi & Fasilitas')
                    ->placeholder('Contoh: Lantai vinyl interlock standar FIFA, pencahayaan LED, ruang ganti, shower air hangat...')
                    ->rows(3)
                    ->columnSpanFull(),

                FileUpload::make('image_url')
                    ->label('Foto Lapangan')
                    ->image()
                    ->disk('public')
                    ->directory('courts')
                    ->columnSpanFull(),
            ]);
    }
}
