<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\MoMoService;
class MoMoController extends Controller
{
    private $momoService;

    public function __construct(MoMoService $momoService)
    {
        $this->momoService = $momoService;
    }

    public function createPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'order_info' => 'required|string'
        ]);

        try {
            $response = $this->momoService->createPayment(
                $request->order_info,
                $request->amount
            );

            if ($response['resultCode'] == 0) {
                return redirect($response['payUrl']);
            } else {
                return back()->with('error', 'Có lỗi xảy ra khi tạo thanh toán: ' . $response['message']);
            }
        } catch (\Exception $e) {
            Log::error('MoMo Payment Error: ' . $e->getMessage());
            return back()->with('error', 'Có lỗi xảy ra khi kết nối với MoMo');
        }
    }

    public function callback(Request $request)
    {
        $data = $request->all();

        if ($this->momoService->verifySignature($data)) {
            if ($data['resultCode'] == 0) {
                // Thanh toán thành công
                Log::info('Payment success', $data);
                return view('payment.success', compact('data'));
            } else {
                // Thanh toán thất bại
                Log::info('Payment failed', $data);
                return view('payment.failed', compact('data'));
            }
        } else {
            Log::error('Invalid signature', $data);
            return view('payment.error');
        }
    }

    public function ipn(Request $request)
    {
        $data = $request->all();

        if ($this->momoService->verifySignature($data)) {
            if ($data['resultCode'] == 0) {
                // Xử lý logic cập nhật đơn hàng thành công
                Log::info('IPN Payment success', $data);

                // TODO: Cập nhật trạng thái đơn hàng trong database

                return response()->json(['status' => 'success']);
            } else {
                Log::info('IPN Payment failed', $data);
                return response()->json(['status' => 'failed']);
            }
        } else {
            Log::error('IPN Invalid signature', $data);
            return response()->json(['status' => 'error']);
        }
    }
}