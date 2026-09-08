<?php

namespace App\Filament\Owner\Resources\ActivityLogs\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ActivityLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Aktivitas')
                    ->description('Detail riwayat aktivitas yang terjadi pada venue Anda')
                    ->components([
                        Grid::make(2)
                            ->components([
                                TextInput::make('created_at')
                                    ->label('Waktu')
                                    ->formatStateUsing(fn ($state) => $state ? date('d M Y - H:i:s', strtotime($state)) : '-')
                                    ->disabled(),

                                TextInput::make('event')
                                    ->label('Jenis Aksi')
                                    ->formatStateUsing(fn ($state) => strtoupper($state ?? '-'))
                                    ->disabled(),

                                TextInput::make('causer_info')
                                    ->label('Oleh')
                                    ->formatStateUsing(fn ($record) => $record?->causer ? $record->causer->name : 'Sistem Otomatis')
                                    ->disabled(),

                                TextInput::make('subject_info')
                                    ->label('Terkait')
                                    ->formatStateUsing(function ($record) {
                                        if (!$record || !$record->subject_type) return '-';
                                        $type = class_basename($record->subject_type);
                                        return "{$type} (ID: {$record->subject_id})";
                                    })
                                    ->disabled(),
                            ]),

                        Textarea::make('description')
                            ->label('Keterangan')
                            ->rows(2)
                            ->disabled()
                            ->columnSpanFull(),
                    ]),

                Section::make('Rincian Perubahan')
                    ->components([
                        Textarea::make('formatted_properties')
                            ->label('Data / Payload')
                            ->formatStateUsing(function ($record) {
                                if (!$record) return '-';
                                $props = $record->properties?->toArray() ?? [];
                                return json_encode($props, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                            })
                            ->rows(6)
                            ->disabled()
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
