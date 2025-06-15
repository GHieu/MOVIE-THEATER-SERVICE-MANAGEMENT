<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;


class PaymentController extends Controller
{
    public function createPayment(Request $req)
    {
        $endpoint = config('momo.endpoint');
        $partnerCode = config('momo.partner_code');
        $accessKey = config('momo.access_key');
        $secretKey = config('momo.secret_key');
        $orderId = Str::uuid();
        $orderInfo = "Thanh toán vé xem phim #" . $orderId;
        $amount = (string) $req->amount;
        $ipnUrl = config('momo.notify_url');
        $redirectUrl = config('momo.return_url');
        $requestId = time() . "";
        $extraData = "";

        $rawHash = "accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl"
            . "&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode"
            . "&redirectUrl=$redirectUrl&requestId=$requestId&requestType=captureWallet";
        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        $data = compact(
            'partnerCode',
            'accessKey',
            'requestId',
            'amount',
            'orderId',
            'orderInfo',
            'redirectUrl',
            'ipnUrl',
            'extraData'
        );
        $data += [
            'partnerName' => 'DemoCinema',
            'storeId' => 'Store001',
            'lang' => 'vi',
            'requestType' => 'captureWallet',
            'signature' => $signature
        ];

        $curl = curl_init($endpoint);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
        ]);

        $result = curl_exec($curl);
        curl_close($curl);
        $resJson = json_decode($result, true);
        \Log::info('MoMo response:', $resJson);
        return redirect($resJson['payUrl'] ?? '/');
    }

    public function handleReturn(Request $req)
    {
        Log::info('🔙 Return URL data:', $req->all());

        if ($req->get('resultCode') === '0') {
            return redirect('/api/payment/success?orderId=' . $req->get('orderId'));
        }

        return redirect('/api/payment/failure?orderId=' . $req->get('orderId'));
    }

    public function handleNotify(Request $req)
    {
        Log::info('📩 MoMo IPN data:', $req->all());

        $data = $req->all();
        $valid = $this->verifySignature($data, config('momo.secret_key'));

        if ($valid && isset($data['resultCode']) && $data['resultCode'] === '0') {
            // ✅ Cập nhật trạng thái Vé/Đơn hàng (ví dụ)
            // MyOrder::where('order_id', $data['orderId'])
            //    ->update(['status' => 'paid']);

            return response()->json(['message' => 'OK'], 200);
        }

        return response()->json(['message' => 'Invalid signature'], 400);
    }

    private function verifySignature(array $data, string $secretKey): bool
    {
        $signatureMoMo = $data['signature'] ?? '';

        $fields = [
            'accessKey',
            'amount',
            'extraData',
            'message',
            'orderId',
            'orderInfo',
            'orderType',
            'partnerCode',
            'payType',
            'requestId',
            'responseTime',
            'resultCode',
            'transId'
        ];
        $hashString = '';
        $arr = [];
        foreach ($fields as $key) {
            if (isset($data[$key])) {
                $arr[$key] = $data[$key];
            }
        }
        ksort($arr);
        foreach ($arr as $k => $v) {
            $hashString .= "$k=$v&";
        }
        $hashString = rtrim($hashString, "&");
        $sign = hash_hmac('sha256', $hashString, $secretKey);

        return $sign === $signatureMoMo;
    }
}