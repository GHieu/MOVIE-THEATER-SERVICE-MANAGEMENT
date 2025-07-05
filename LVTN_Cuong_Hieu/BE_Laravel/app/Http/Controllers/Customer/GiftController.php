<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gift;
use App\Models\GiftHistory;
use App\Models\Membership;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
class GiftController extends Controller
{
    public function index()
    {
        $gifts = Gift::with('promotion')
            ->where('stock', '>', 0)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($gifts);
    }

    public function exchange(Request $request)
    {
        $request->validate([
            'gift_id' => [
                'required',
                'integer',      // is numeric, integer check
                'min:1',        // positive
                'exists:gifts,id'
            ],
            'quantity' => [
                'nullable',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:1',        // positive
                'max:10'        // range check
            ]
        ]);

        $customerId = Auth::guard('customer')->id();

        return DB::transaction(function () use ($request, $customerId) {
            $gift = Gift::findOrFail($request->gift_id);
            $membership = Membership::where('customer_id', $customerId)->first();

            if (!$membership) {
                return response()->json(['message' => 'Bạn chưa có thẻ thành viên'], 403);
            }

            if ($membership->point < $gift->point_required) {
                return response()->json(['message' => 'Không đủ điểm để đổi quà'], 400);
            }

            if ($gift->stock <= 0) {
                return response()->json(['message' => 'Quà đã hết hàng'], 400);
            }

            $membership->decrement('point', $gift->point_required);
            $gift->decrement('stock');

            $history = GiftHistory::create([
                'customer_id' => $customerId,
                'gift_id' => $gift->id,
                'exchanged_at' => Carbon::now(),
                'image' => $gift->image
            ]);

            return response()->json([
                'message' => 'Đổi quà thành công',
                'history' => $history
            ]);
        });
    }
}