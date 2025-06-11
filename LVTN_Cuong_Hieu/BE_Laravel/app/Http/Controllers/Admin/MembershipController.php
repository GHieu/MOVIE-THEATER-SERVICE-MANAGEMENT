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
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'member_type' => 'required|string|max:20',
            'point' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $membership = Membership::create($request->all());

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
            'member_type' => 'nullable|string|max:20',
            'point' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $membership->update($request->only(['member_type', 'point']));

        return response()->json($membership, 200);
    }
}