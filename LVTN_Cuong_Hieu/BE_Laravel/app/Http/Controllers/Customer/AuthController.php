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
            'name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[\p{L}\s]+$/u', // chỉ cho phép chữ cái và khoảng trắng
            ],
            'birthdate' => [
                'required',
                'date_format:Y-m-d', // định dạng ngày tháng hợp lệ
                'date',              // ngày hợp lệ
                'before:today',      // ngày trong quá khứ
                function ($attribute, $value, $fail) {
                    $age = \Carbon\Carbon::parse($value)->age;
                    if ($age < 10 || $age > 70) {
                        $fail('Tuổi phải từ 10 đến 70.');
                    }
                    if (!is_numeric($age) || $age < 0 || floor($age) != $age) {
                        $fail('Tuổi phải là số nguyên dương.');
                    }
                }
            ],
            'gender' => 'required|in:male,female,other',
            'phone' => [
                'required',
                'regex:/^0[0-9]{9}$/', // SĐT bắt đầu bằng 0 và có 10 số
                'unique:customers,phone'
            ],
            'address' => [
                'required',
                'string',
                'min:5',
                'max:100'
            ],
            'email' => [
                'required',
                'email',
                'max:100',
                'unique:customers,email'
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:70',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]+$/'
            ],
        ], [
            'name.regex' => 'Tên chỉ được chứa chữ cái và khoảng trắng.',
            'phone.regex' => 'Số điện thoại phải bắt đầu bằng 0 và có 10 số.',
            'birthdate.date_format' => 'Ngày sinh phải đúng định dạng Y-m-d.',
            'password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số, chỉ cho phép ký tự hợp lệ.',
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