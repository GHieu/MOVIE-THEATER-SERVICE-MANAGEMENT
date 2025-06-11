<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Service;

class ServiceController extends Controller
{
    //Danh sách
    public function index()
    {
        return response()->json(Service::all());
    }

    //Thêm
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'required|image|max:2048',
            'status' => 'required|boolean'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $service = Service::create($validated);
        return response()->json($service, 201);
    }

    //Cập nhật
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'sometimes|required|image|max:2048',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }

        $service->update($validated);

        return response()->json($service);
    }


    //Xoá
    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        $service->delete();
        return response()->json(['message' => 'Xoá thành công']);
    }
}