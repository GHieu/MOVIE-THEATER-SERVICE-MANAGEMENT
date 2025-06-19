<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|regex:/^[\p{L}\s]+$/u', // chỉ cho phép chữ cái và khoảng trắng
            'birthdate' => 'required|date|before:today', // ngày sinh phải trước hôm nay
            'gender' => 'required|in:male,female,other', // giới tính hợp lệ
            'phone' => 'required|regex:/^0[0-9]{9}$/|unique:customers,phone', // SĐT bắt đầu bằng 0 và có 10 số
            'address' => 'required|string|max:100',
            'email' => 'required|email|unique:customers,email',
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d).+$/' // ít nhất 1 chữ hoa và 1 số
            ],
        ]);


        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $customer = Customer::create([
            'name' => $request->name,
            'birthdate' => $request->birthdate,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'address' => $request->address,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $customer->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }






    public function login(Request $request)
    {
        // 1. Xác thực đầu vào
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

        // 2. Tìm khách hàng theo email
        $customer = Customer::where('email', $credentials['email'])->first();

        // 3. Kiểm tra mật khẩu
        if (!$customer || !Hash::check($credentials['password'], $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.']
            ]);
        }

        // 4. Tạo token API
        $token = $customer->createToken('customer_token')->plainTextToken;

        // 5. Trả về response JSON
        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }
}