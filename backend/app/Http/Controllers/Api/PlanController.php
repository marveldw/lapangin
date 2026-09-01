<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data'    => $plans,
        ]);
    }
}