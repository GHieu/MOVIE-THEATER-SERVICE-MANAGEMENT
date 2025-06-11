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
    public function exchange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'gift_id' => 'required|exists:gifts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $gift = Gift::find($request->gift_id);
            $membership = Membership::where('customer_id', $request->customer_id)->first();

            if (!$membership) {
                return response()->json(['message' => 'Customer does not have a membership'], 404);
            }

            if ($membership->point < $gift->point_required) {
                return response()->json(['message' => 'Not enough points'], 400);
            }

            if ($gift->stock <= 0) {
                return response()->json(['message' => 'Gift out of stock'], 400);
            }

            // Trừ điểm và giảm tồn kho
            $membership->decrement('point', $gift->point_required);
            $gift->decrement('stock', 1);

            $history = GiftHistory::create([
                'customer_id' => $request->customer_id,
                'gift_id' => $request->gift_id,
                'exchanged_at' => Carbon::now()
            ]);

            return response()->json(['message' => 'Gift exchanged successfully', 'history' => $history], 200);
        });
    }
}