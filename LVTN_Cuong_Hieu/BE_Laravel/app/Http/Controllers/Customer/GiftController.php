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
    public function exchange(Request $request)
    {
        $request->validate([
            'gift_id' => 'required|exists:gifts,id'
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

            $membership->point -= $gift->point_required;
            if ($membership->point < 0) {
                $membership->point = 0;
            }
            $membership->save();

            $gift->decrement('stock');

            $history = GiftHistory::create([
                'customer_id' => $customerId,
                'gift_id' => $gift->id,
                'exchanged_at' => Carbon::now()
            ]);

            return response()->json([
                'message' => 'Đổi quà thành công',
                'history' => $history
            ]);
        });
    }
}