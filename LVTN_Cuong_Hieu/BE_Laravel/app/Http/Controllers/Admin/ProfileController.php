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
            'email' => [
                'sometimes',
                'required',
                'email',
                'unique:admins,email,' . $admin->id
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'min:10',
                'max:20',
                'regex:/^[0-9+\-\s]+$/'
            ],
            'address' => 'sometimes|nullable|string|min:5|max:255',
            // Kiểm tra số, số nguyên dương, khoảng giá trị, min/max age
            'age' => [
                'sometimes',
                'required',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:20',       // min age
                'max:70'       // max age
            ],
            // Kiểm tra ngày sinh hợp lệ, định dạng, quá khứ, range
            'birthday' => [
                'sometimes',
                'required',
                'date_format:Y-m-d', // định dạng ngày tháng hợp lệ
                'date',              // ngày hợp lệ
                'before:today',      // ngày trong quá khứ
            ],
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
            'current_password' => 'required|string|min:6',
            'new_password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/'
            ],
        ], [
            'new_password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.'
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