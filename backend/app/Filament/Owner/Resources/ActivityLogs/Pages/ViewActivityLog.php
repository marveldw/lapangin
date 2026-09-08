<?php

namespace App\Filament\Owner\Resources\ActivityLogs\Pages;

use App\Filament\Owner\Resources\ActivityLogs\ActivityLogResource;
use Filament\Resources\Pages\ViewRecord;

class ViewActivityLog extends ViewRecord
{
    protected static string $resource = ActivityLogResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
