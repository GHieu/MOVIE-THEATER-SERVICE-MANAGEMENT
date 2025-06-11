<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class ProfileController extends Controller
{
    //Hiện thông tin khách hàng
    public function show()
    {
        return response()->json(Auth::guard('customer')->user());
    }

    //Cập nhật
    public function update(Request $request)
    {
        $customer = Auth::guard('customer')->user();

        $validated = $request->validate([
            'email' => 'sometimes|email|unique:customers,email,' . $customer->id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:255',
        ]);

        $customer->update($validated);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công.',
            'customer' => $customer
        ]);
    }

    //Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $customer = Auth::guard('customer')->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed'
        ]);

        if (!Hash::check($request->current_password, $customer->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng.']
            ]);
        }

        $customer->password = Hash::make($request->new_password);
        $customer->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công!']);
    }
}