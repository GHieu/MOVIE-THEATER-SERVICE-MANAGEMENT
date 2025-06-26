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

    // API endpoint cho JavaScript
    public function createPaymentApi(Request $request)
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

            Log::info('MoMo API Response:', $response);

            if ($response['resultCode'] == 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tạo thanh toán thành công',
                    'payUrl' => $response['payUrl'],
                    'orderId' => $response['orderId'],
                    'requestId' => $response['requestId']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $response['message'] ?? 'Có lỗi xảy ra khi tạo thanh toán',
                    'resultCode' => $response['resultCode']
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('MoMo Payment API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi kết nối với MoMo: ' . $e->getMessage()
            ], 500);
        }
    }

    // Web endpoint cho form submission
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
                // Redirect trực tiếp đến MoMo cho web
                return redirect($response['payUrl']);
            } else {
                return back()->with('error', 'Có lỗi xảy ra khi tạo thanh toán: ' . $response['message']);
            }
        } catch (\Exception $e) {
            Log::error('MoMo Payment Error: ' . $e->getMessage());
            return back()->with('error', 'Có lỗi xảy ra khi kết nối với MoMo');
        }
    }

    // Test endpoint để kiểm tra config
    public function testConfig()
    {
        $config = [
            'partner_code' => config('services.momo.partner_code'),
            'access_key' => config('services.momo.access_key'),
            'secret_key' => config('services.momo.secret_key') ? 'SET' : 'NOT SET',
            'endpoint' => config('services.momo.endpoint'),
            'redirect_url' => config('services.momo.redirect_url'),
            'ipn_url' => config('services.momo.ipn_url'),
        ];

        return response()->json($config);
    }

    public function callback(Request $request)
    {
        $data = $request->all();
        Log::info('MoMo Callback received', $data);

        if ($this->momoService->verifySignature($data)) {
            if ($data['resultCode'] == 0) {
                Log::info('Payment success', $data);
                return view('momo.success', compact('data'));
            } else {
                Log::info('Payment failed', $data);
                return view('momo.error', compact('data'));
            }
        } else {
            Log::error('Invalid signature', $data);
            return view('momo.error', ['data' => ['message' => 'Invalid signature']]);
        }
    }

    public function ipn(Request $request)
    {
        $data = $request->all();
        Log::info('MoMo IPN received', $data);

        if ($this->momoService->verifySignature($data)) {
            if ($data['resultCode'] == 0) {
                Log::info('IPN Payment success', $data);
                return response()->json(['status' => 'success']);
            } else {
                Log::info('IPN Payment failed', $data);
                return response()->json(['status' => 'failed']);
            }
        } else {
            Log::error('IPN Invalid signature', $data);
            return response()->json(['status' => 'error'], 400);
        }
    }
}