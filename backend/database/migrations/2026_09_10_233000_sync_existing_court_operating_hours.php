<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $courts = DB::table('courts')->select(['court_id', 'description'])->get();

        foreach ($courts as $court) {
            $openTime = null;
            $closeTime = null;

            if (!empty($court->description)) {
                if (preg_match('/Jam Operasional:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/', $court->description, $matches)) {
                    $openTime = $matches[1] . ':00';
                    $closeTime = $matches[2] . ':00';
                }
            }

            // Explicit fix for court ID 6 if needed
            if ($court->court_id == 6) {
                $openTime = '06:00:00';
                $closeTime = '19:00:00';
            }

            if ($openTime && $closeTime) {
                for ($day = 0; $day <= 6; $day++) {
                    $exists = DB::table('court_operating_hours')
                        ->where('court_id', $court->court_id)
                        ->where('day_of_week', $day)
                        ->exists();

                    if ($exists) {
                        DB::table('court_operating_hours')
                            ->where('court_id', $court->court_id)
                            ->where('day_of_week', $day)
                            ->update([
                                'open_time'  => $openTime,
                                'close_time' => $closeTime,
                                'is_closed'  => false,
                                'updated_at' => now(),
                            ]);
                    } else {
                        DB::table('court_operating_hours')->insert([
                            'court_id'    => $court->court_id,
                            'day_of_week' => $day,
                            'open_time'   => $openTime,
                            'close_time'  => $closeTime,
                            'is_closed'   => false,
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ]);
                    }
                }
            }
        }
    }

    public function down(): void
    {
        // Keep data intact
    }
};
