<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GiftHistory;
use App\Models\Gift;
use App\Models\Membership;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
class GifthistoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'customer' => [
                'nullable',
                'string',
                'min:2', // Độ dài tối thiểu
                'max:100',
                'regex:/^[\pL\s\-\.]+$/u' // Ký tự cho phép: chữ, khoảng trắng, -, .
            ],
            'gift' => [
                'nullable',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s0-9\.\,\!\?\-]+$/u' // Ký tự cho phép: chữ, số, khoảng trắng, .,!?-
            ],
            'from_date' => [
                'nullable',
                'date', // Ngày hợp lệ
                'date_format:Y-m-d', // Định dạng ngày
                'before_or_equal:to_date', // Start Date <= End Date
                'before_or_equal:today', // Không được là ngày trong tương lai
            ],
            'to_date' => [
                'nullable',
                'date',
                'date_format:Y-m-d',
                'after_or_equal:from_date',
                'before_or_equal:today',
            ],
            'min_point' => [
                'nullable',
                'numeric', // Là số
                'integer', // Số nguyên
                'min:0',   // Số dương hoặc 0
                'max:1000000' // Khoảng giá trị
            ],
            'max_point' => [
                'nullable',
                'numeric',
                'integer',
                'min:0',
                'max:1000000'
            ],
        ]);



        $query = GiftHistory::with(['customer:id,name,email', 'gift:id,name']);

        if ($request->filled('from_date')) {
            $query->whereDate('exchanged_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('exchanged_at', '<=', $request->to_date);
        }


        // Lọc theo tên khách hàng
        if ($request->has('customer')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }

        // Lọc theo tên quà
        if ($request->has('gift')) {
            $query->whereHas('gift', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->gift . '%');
            });
        }

        $history = $query->orderByDesc('exchanged_at')->paginate(10);

        return response()->json($history);
    }

}