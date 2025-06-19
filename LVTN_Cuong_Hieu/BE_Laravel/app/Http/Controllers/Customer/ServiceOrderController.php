<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ServiceOrder;
class ServiceOrderController extends Controller
{
    public function createServiceOrder(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'service_id' => 'required|exists:services,id',
            'quantity' => 'required|integer|min:1|max:10',
            'promotion_id' => 'nullable|exists:promotions,id'
        ]);

        $serviceOrder = ServiceOrder::create($validated);

        return response()->json(['message' => 'Đã thêm dịch vụ', 'data' => $serviceOrder]);
    }
}