<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gift;
use Illuminate\Support\Facades\Validator;
class GiftController extends Controller
{
    //Hiện danh sách
    public function index()
    {
        return response()->json(Gift::with('promotion')->get(), 200);
    }

    //Thêm
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'promotion_id' => 'nullable|exists:promotions,id',
            'name' => 'required|string|max:50',
            'description' => 'required|string',
            'point_required' => 'required|integer|min:1',
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $gift = Gift::create($request->all());

        return response()->json($gift, 201);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $gift = Gift::find($id);
        if (!$gift)
            return response()->json(['message' => 'Gift not found'], 404);

        $validator = Validator::make($request->all(), [
            'promotion_id' => 'nullable|exists:promotions,id',
            'name' => 'string|max:50',
            'description' => 'string',
            'point_required' => 'integer|min:1',
            'stock' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $gift->update($request->all());
        return response()->json($gift, 200);
    }

    //Xoá
    public function destroy($id)
    {
        $gift = Gift::find($id);
        if (!$gift)
            return response()->json(['message' => 'Không tìm thấy quà'], 404);

        $gift->delete();
        return response()->json(['message' => 'Xoá quà thành công'], 200);
    }
}