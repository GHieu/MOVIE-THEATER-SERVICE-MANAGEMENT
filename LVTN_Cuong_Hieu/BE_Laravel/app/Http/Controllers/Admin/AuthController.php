<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller
{
    public function login(Request $request)
    {

        $credentials = $request->validate([
            'email' => 'required|email|max:100', // định dạng email + giới hạn độ dài
            'password' => [
                'required',
                'string',
                'min:6',        // tối thiểu 6 ký tự
                'max:70',       // tối đa 70 ký tự
                'regex:/^[A-Za-z0-9!@#$%^&*()_+=-]+$/', // chỉ cho ký tự hợp lệ
            ],
        ]);


        $admin = Admin::where('email', $credentials['email'])->first();


        if (!$admin || !Hash::check($credentials['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.'],
            ]);
        }


        $token = $admin->createToken('admin_token')->plainTextToken;


        return response()->json([
            'message' => 'Đăng nhập thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'admin' => $request->user()
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!'
        ]);
    }
}