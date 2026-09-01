<?php

namespace App\Filament\Owner\Resources\Courts\Pages;

use App\Filament\Owner\Resources\Courts\CourtResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCourt extends EditRecord
{
    protected static string $resource = CourtResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
