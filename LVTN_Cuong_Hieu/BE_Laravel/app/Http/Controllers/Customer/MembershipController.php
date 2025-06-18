<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Membership;
use Illuminate\Support\Facades\Auth;
class MembershipController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'member_type' => 'required|in:Silver,Gold,Diamond'
        ]);

        $customerId = Auth::guard('customer')->id();

        if (Membership::where('customer_id', $customerId)->exists()) {
            return response()->json(['message' => 'Bạn đã là thành viên rồi'], 400);
        }

        $membership = Membership::create([
            'customer_id' => $customerId,
            'member_type' => $request->member_type,
            'point' => 0,
            'total_points' => 0
        ]);

        return response()->json([
            'message' => 'Đăng ký thẻ thành viên thành công',
            'membership' => $membership
        ]);
    }

    public function profile()
    {
        $customerId = Auth::guard('customer')->id();
        $membership = Membership::where('customer_id', $customerId)->first();

        if (!$membership) {
            return response()->json(['message' => 'Chưa đăng ký thành viên'], 404);
        }

        return response()->json($membership);
    }
}