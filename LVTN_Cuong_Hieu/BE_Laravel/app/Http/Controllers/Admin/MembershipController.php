<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Membership;
use Illuminate\Support\Facades\Validator;
class MembershipController extends Controller
{
    //hiện danh sách
    public function index()
    {
        return response()->json(Membership::with('customer')->get(), 200);
    }

    //Thêm
    public function store(Request $request)
    {
        $types = ['Silver', 'Gold', 'Diamond'];

        $validator = Validator::make($request->all(), [
            'customer_id' => [
                'required',
                'numeric', // Là số
                'integer', // Số nguyên
                'min:1',   // Số dương
                'exists:customers,id'
            ],
            'point' => [
                'required',
                'numeric', // Là số
                'integer', // Số nguyên
                'min:0',   // Số không âm
                'max:100000' // Khoảng giá trị
            ],
            'total_points' => [
                'nullable',
                'numeric',
                'integer',
                'min:0',
                'max:100000'
            ],
            // Nếu có trường ngày bắt đầu/kết thúc:
            // 'start_date' => 'nullable|date|date_format:Y-m-d|before_or_equal:end_date',
            // 'end_date'   => 'nullable|date|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['customer_id', 'point', 'total_points']);
        $data['total_points'] = $data['total_points'] ?? 0;

        // Gán loại thành viên theo mốc total_points
        if ($data['total_points'] >= 1000) {
            $data['member_type'] = 'Diamond';
        } elseif ($data['total_points'] >= 300) {
            $data['member_type'] = 'Gold';
        } else {
            $data['member_type'] = 'Silver';
        }

        $membership = Membership::create($data);
        return response()->json($membership, 201);
    }


    // Cập nhật điểm hoặc loại thành viên
    public function update(Request $request, $id)
    {
        $membership = Membership::find($id);

        if (!$membership) {
            return response()->json(['message' => 'Membership not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'point' => [
                'nullable',
                'numeric',
                'integer',
                'min:0',
                'max:100000'
            ],
            'total_points' => [
                'nullable',
                'numeric',
                'integer',
                'min:0',
                'max:100000'
            ],
            // 'start_date' => 'nullable|date|date_format:Y-m-d|before_or_equal:end_date',
            // 'end_date'   => 'nullable|date|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $membership->update($request->only(['point', 'total_points']));

        // Tính lại loại thẻ theo tổng điểm tích luỹ
        if ($membership->total_points >= 1000) {
            $membership->member_type = 'Diamond';
        } elseif ($membership->total_points >= 300) {
            $membership->member_type = 'Gold';
        } else {
            $membership->member_type = 'Silver';
        }

        $membership->save();

        return response()->json($membership, 200);
    }

}