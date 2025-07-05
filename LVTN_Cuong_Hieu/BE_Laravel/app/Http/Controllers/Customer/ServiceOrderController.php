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
            'ticket_id' => [
                'required',
                'numeric',      // is numeric
                'integer',      // integer check
                'min:1',        // positive
                'exists:tickets,id'
            ],
            'service_id' => [
                'required',
                'numeric',
                'integer',
                'min:1',
                'exists:services,id'
            ],
            'quantity' => [
                'required',
                'numeric',
                'integer',
                'min:1',        // positive
                'max:10'        // range check
            ],
            'promotion_id' => [
                'nullable',
                'numeric',
                'integer',
                'min:1',
                'exists:promotions,id'
            ]
        ]);

        $serviceOrder = ServiceOrder::create($validated);

        return response()->json(['message' => 'Đã thêm dịch vụ', 'data' => $serviceOrder]);
    }
}