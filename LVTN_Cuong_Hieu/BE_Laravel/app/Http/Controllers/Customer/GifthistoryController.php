<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GiftHistory;
use Illuminate\Support\Facades\Auth;
class GifthistoryController extends Controller
{
    public function history()
    {
        $customerId = Auth::guard('customer')->id();
        $history = GiftHistory::with('gift')->where('customer_id', $customerId)->get();

        return response()->json($history);
    }
}