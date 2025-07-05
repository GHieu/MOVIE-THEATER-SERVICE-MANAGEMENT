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
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:100',
                'unique:customers,email,' . $customer->id
            ],
            'phone' => [
                'sometimes',
                'required',
                'regex:/^0[0-9]{9}$/', // number format check
                'unique:customers,phone,' . $customer->id
            ],
            'address' => [
                'sometimes',
                'required',
                'string',
                'min:5',
                'max:100'
            ],
            'age' => [
                'sometimes',
                'required',
                'integer',      // integer check
                'min:10',       // min age
                'max:120'       // max age
            ],
            'birthday' => [
                'sometimes',
                'required',
                'date_format:Y-m-d', // valid date format
                'date',              // valid date
                'before:today'       // past date check
            ]
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
            'new_password' => [
                'required',
                'string',
                'min:6',
                'max:70',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]+$/'
            ],
        ], [
            'new_password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số, chỉ cho phép ký tự hợp lệ.',
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

    //Hiển thị mật khẩu
    public function changePasswordGet(Request $request)
    {
        $current = $request->query('current_password');
        $new = $request->query('new_password');
        $confirm = $request->query('new_password_confirmation');

        if (!$current || !$new || !$confirm) {
            return response()->json(['message' => 'Thiếu thông tin đầu vào.'], 400);
        }

        if ($new !== $confirm) {
            return response()->json(['message' => 'Xác nhận mật khẩu không khớp.'], 400);
        }

        $customer = $request->user();

        if (!Hash::check($current, $customer->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $customer->password = Hash::make($new);
        $customer->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công (GET).']);
    }
}