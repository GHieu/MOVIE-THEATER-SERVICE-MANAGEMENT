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
            'name' => 'required|string|min:3|max:50|regex:/^[\pL\s0-9\.\,\!\?\-]+$/u',
            'description' => 'required|string|min:10|max:1000',
            'point_required' => 'required|integer|min:1|max:10000',
            'stock' => 'required|integer|min:0|max:100000',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $gift = Gift::create($validated);

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
            'name' => 'sometimes|string|min:3|max:50|regex:/^[\pL\s0-9\.\,\!\?\-]+$/u',
            'description' => 'sometimes|string|min:10|max:1000',
            'point_required' => 'sometimes|integer|min:1|max:10000',
            'stock' => 'sometimes|integer|min:0|max:100000',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $gift->update($validated);
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