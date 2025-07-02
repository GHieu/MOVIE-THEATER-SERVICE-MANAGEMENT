<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GiftHistory;
use App\Models\Gift;
use App\Models\Membership;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
class GifthistoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'customer' => 'nullable|string|max:100',
            'gift' => 'nullable|string|max:100',
        ]);



        $query = GiftHistory::with(['customer:id,name,email', 'gift:id,name']);

        $request->validate([
            'from_date' => 'nullable|date|before_or_equal:to_date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
        ]);

        if ($request->filled('from_date')) {
            $query->whereDate('exchanged_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('exchanged_at', '<=', $request->to_date);
        }


        // Lọc theo tên khách hàng
        if ($request->has('customer')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }

        // Lọc theo tên quà
        if ($request->has('gift')) {
            $query->whereHas('gift', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->gift . '%');
            });
        }

        $history = $query->orderByDesc('exchanged_at')->paginate(10);

        return response()->json($history);
    }

}