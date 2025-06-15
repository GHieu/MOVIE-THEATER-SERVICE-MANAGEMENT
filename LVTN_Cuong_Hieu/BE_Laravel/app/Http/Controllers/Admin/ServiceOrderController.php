<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ServiceOrder;
class ServiceOrderController extends Controller
{
    public function index()
    {
        $orders = ServiceOrder::whereHas('ticket', function ($query) {
            $query->where('status', 'paid');
        })->with(['ticket', 'service'])->get();

        return response()->json([
            'data' => $orders
        ]);
    }

}