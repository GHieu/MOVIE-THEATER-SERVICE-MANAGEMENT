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
}