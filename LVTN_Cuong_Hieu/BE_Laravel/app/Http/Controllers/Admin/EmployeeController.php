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
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'position' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('images')->store('images', 'public');
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
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'position' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'sometimes|required|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('images')->store('images', 'public');
        }

        $employee->update($validated);
        return response()->json($employee);
    }
}