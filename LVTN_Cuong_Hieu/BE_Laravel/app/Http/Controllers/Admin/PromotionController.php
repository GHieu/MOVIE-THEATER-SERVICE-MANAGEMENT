<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;
class PromotionController extends Controller
{
    //hiển thị danh sách
    public function index()
    {
        return response()->json(Promotion::all(), 200);
    }

    // Thêm mới khuyến mãi
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Không rỗng, độ dài, định dạng, ký tự cho phép, regex
            'title' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[a-zA-Z0-9\s\-]+$/'
            ],
            'description' => 'required|string|min:10|max:1000',
            // Số thập phân, khoảng giá trị, is numeric, positive/negative check
            'discount_percent' => [
                'required',
                'numeric',           // is numeric
                'min:0',             // positive
                'max:100',           // range check
                'regex:/^\d+(\.\d{1,2})?$/' // number format check (tối đa 2 số thập phân)
            ],
            // Số, số dương, is numeric, integer/decimal check
            'discount_amount' => [
                'required',
                'numeric',           // is numeric
                'min:0',             // positive
                'regex:/^\d+(\.\d{1,2})?$/' // number format check
            ],
            'apply_to' => 'required|string|in:ticket,service,gift',
            // Định dạng ngày tháng hợp lệ, valid date, range check, start <= end, future/past date check
            'start_date' => [
                'required',
                'date_format:Y-m-d', // valid date format
                'date',              // valid date
                'before_or_equal:end_date', // start <= end
                'after_or_equal:today'      // future or today
            ],
            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:start_date'
            ],
            'status' => 'required|boolean',
        ], [
            'title.regex' => 'Tiêu đề chỉ được chứa chữ, số, khoảng trắng và dấu gạch ngang.',
            'discount_percent.regex' => 'Phần trăm giảm giá phải là số, tối đa 2 chữ số thập phân.',
            'discount_amount.regex' => 'Số tiền giảm giá phải là số, tối đa 2 chữ số thập phân.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $promotion = Promotion::create($request->all());

        return response()->json($promotion, 201);
    }

    // Xoá khuyến mãi
    public function destroy($id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Không tìm thấy mã khuyến mãi'], 404);
        }

        $promotion->delete();

        return response()->json(['message' => 'Mã khuyến mãi được xoá thành công'], 200);
    }
}