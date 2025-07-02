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
            'customer_id' => 'required|exists:customers,id',
            'member_type' => 'required|string|in:' . implode(',', $types),
            'point' => 'required|integer|min:0|max:100000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $membership = Membership::create($request->all());

        $membership->refresh();

        if ($membership->total_points >= 200) {
            $membership->member_type = 'Diamond';
        } elseif ($membership->total_points >= 100) {
            $membership->member_type = 'Gold';
        } else {
            $membership->member_type = 'Silver';
        }
        $membership->save();

        return response()->json($membership, 201);
    }

    // Cập nhật điểm hoặc loại thành viên
    public function update(Request $request, $id)
    {
        $membership = Membership::find($id);

        if (!$membership) {
            return response()->json(['message' => 'Membership not found'], 404);
        }

        $types = ['Silver', 'Gold', 'Diamond'];
        $validator = Validator::make($request->all(), [
            'member_type' => 'nullable|string|in:' . implode(',', $types),
            'point' => 'nullable|integer|min:0|max:100000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $membership->update($request->only(['member_type', 'point']));

        if ($membership->total_points >= 200) {
            $membership->member_type = 'Diamond';
        } elseif ($membership->total_points >= 100) {
            $membership->member_type = 'Gold';
        } else {
            $membership->member_type = 'Silver';
        }
        $membership->save();

        return response()->json($membership, 200);
    }
}