<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    //Hiển thị thông tin    
    public function show()
    {
        return response()->json(Auth::guard('admin')->user());
    }

    //Cập nhật
    public function update(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        $validated = $request->validate([
            'email' => 'sometimes|email|unique:admins,email,' . $admin->id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string'
        ]);

        $admin->update($validated);
        return response()->json([
            'message' => 'Cập nhật thành công',
            'admin' => $admin
        ]);
    }

    //Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed'
        ]);

        if (!Hash::check($request->current_password, $admin->password)) {
            throw ValidationException::withMessages([
                'current_message' => ['Mật khẩu hiện tại không đúng.']
            ]);
        }

        $admin->password = Hash::make($request->new_password);
        $admin->save();

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

        $admin = $request->user();

        if (!Hash::check($current, $admin->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $admin->password = Hash::make($new);
        $admin->save();

        return response()->json(['message' => 'Đổi mật khẩu thành công (GET).']);
    }
}