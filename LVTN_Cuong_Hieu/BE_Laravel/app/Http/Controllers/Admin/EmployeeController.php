<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;

class EmployeeController extends Controller
{
    //Hiển thị danh sách và tìm kiếm
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->has('keyword')) {
            $query->where('name', 'like', '%' . $request->keyword . '%')
                ->orWhere('position', 'like', '%' . $request->keyword . '%');
        }

        return response()->json($query->latest('created_at')->paginate(10));
    }

    //Thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[\pL\s\-\.]+$/u' // Chữ, khoảng trắng, -, .
            ],
            'phone' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^(0|\+84)[0-9]{8,19}$/' // Định dạng số điện thoại VN
            ],
            'position' => [
                'required',
                'string',
                'min:3',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048'
            ],
            // Ví dụ kiểm tra ngày/tháng/năm sinh (nếu có)
            // 'birthdate' => [
            //     'required',
            //     'date',
            //     'date_format:Y-m-d',
            //     'before_or_equal:today',
            //     'after_or_equal:1950-01-01',
            //     function ($attribute, $value, $fail) {
            //         if ($value) {
            //             $age = \Carbon\Carbon::parse($value)->age;
            //             if ($age < 18 || $age > 65) {
            //                 $fail('Tuổi phải từ 18 đến 65.');
            //             }
            //         }
            //     }
            // ],
            // 'salary' => [
            //     'required',
            //     'numeric', // Là số
            //     'min:0',   // Số dương
            //     'max:100000000', // Khoảng giá trị
            //     'regex:/^\d+(\.\d{1,2})?$/', // Định dạng số thập phân tối đa 2 số lẻ
            // ],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $validated['created_at'] = now();
        $employee = Employee::create($validated);
        return response()->json(
            $employee,
            201
        );
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[\pL\s\-\.]+$/u'
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^(0|\+84)[0-9]{8,19}$/'
            ],
            'position' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'image' => [
                'sometimes',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048'
            ],
            // 'birthdate' => [ ... ] // như trên nếu có
            // 'salary' => [ ... ] // như trên nếu có
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $employee->update($validated);
        return response()->json($employee);
    }
}