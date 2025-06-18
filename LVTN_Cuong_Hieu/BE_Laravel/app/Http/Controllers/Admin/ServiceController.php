<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Service;
use Illuminate\Support\Facades\Validator;
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
            'name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[A-Za-z0-9\s\-]+$/'
            ],
            'description' => 'required|string|min:10|max:1000',
            'price' => 'required|numeric|min:0|max:1000000',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'status' => 'required|boolean',
        ], [
            'name.regex' => 'Tên dịch vụ chỉ được chứa chữ cái, số, khoảng trắng và dấu gạch ngang.'
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
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[A-Za-z0-9\s\-]+$/'
            ],
            'description' => 'sometimes|required|string|min:10|max:1000',
            'price' => 'sometimes|required|numeric|min:0|max:1000000',
            'image' => 'sometimes|required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'status' => 'sometimes|required|boolean',
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