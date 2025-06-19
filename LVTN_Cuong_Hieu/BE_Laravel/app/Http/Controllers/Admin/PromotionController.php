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
            'title' => [
                'required',
                'string',
                'min:5',
                'max:255',
                'regex:/^[a-zA-Z0-9\s\-]+$/'
            ],
            'description' => 'required|string|min:10|max:1000',
            'discount_percent' => 'required|numeric|between:0,100',
            'discount_amount' => 'required|numeric|min:0',
            'apply_to' => 'required|string|in:ticket,service,gift',
            'start_date' => 'required|date|before_or_equal:end_date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|boolean',
        ], [
            'title.regex' => 'Tiêu đề chỉ được chứa chữ, số, khoảng trắng và dấu gạch ngang.'
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