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
            'member_type' => [
                'required',
                'string',
                'in:Silver,Gold,Diamond',
                'max:20', // min/max length check
                'regex:/^[A-Za-z]+$/', // allowed characters, format check
            ],
            // Nếu có nhập điểm ban đầu (hiếm khi cho phép), kiểm tra số:
            'point' => [
                'sometimes',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:0',        // positive
                'max:1000000'   // range check
            ],
            // Nếu có nhập ngày đăng ký, kiểm tra ngày:
            'register_date' => [
                'sometimes',
                'date_format:Y-m-d', // valid date format
                'date',              // valid date
                'before_or_equal:today' // future/past date check
            ],
            // Nếu có nhập tuổi, kiểm tra tuổi:
            'age' => [
                'sometimes',
                'integer',      // integer check
                'min:10',       // min age
                'max:70'       // max age
            ]
        ], [
            'member_type.regex' => 'Loại thẻ chỉ được chứa chữ cái.',
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