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

            //Không phải là thành viên
            if (!$membership) {
                return response()->json(['message' => 'Customer does not have a membership'], 404);
            }

            //Không đủ điểm
            if ($membership->point < $gift->point_required) {
                return response()->json(['message' => 'Not enough points'], 400);
            }

            //Không đủ số lượng quà
            if ($gift->stock <= 0) {
                return response()->json(['message' => 'Gift out of stock'], 400);
            }

            //Thẻ thành viên hết hạn
            if (Carbon::parse($membership->expired_at)->isPast()) {
                return response()->json(['message' => 'Membership expired'], 403);
            }

            // Trừ điểm và giảm tồn kho
            $membership->decrement('point', $gift->point_required);
            $gift->decrement('stock', 1);

            $history = GiftHistory::create([
                'customer_id' => $request->customer_id,
                'gift_id' => $request->gift_id,
                'exchanged_at' => Carbon::now(),
                'image' => $gift->image
            ]);

            return response()->json([
                'message' => 'Gift exchanged successfully',
                'history' => $history,
                'gift' => [
                    'id' => $gift->id,
                    'name' => $gift->name,
                    'image' => $gift->image,
                    'image_url' => $gift->image ? asset('storage/' . $gift->image) : null
                ]
            ], 200);

        });
    }
}