<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
class MoMoService
{
    private $partnerCode;
    private $accessKey;
    private $secretKey;
    private $endpoint;
    private $redirectUrl;
    private $ipnUrl;

    public function __construct()
    {
        $this->partnerCode = config('services.momo.partner_code');
        $this->accessKey = config('services.momo.access_key');
        $this->secretKey = config('services.momo.secret_key');
        $this->endpoint = config('services.momo.endpoint');
        $this->redirectUrl = config('services.momo.redirect_url');
        $this->ipnUrl = config('services.momo.ipn_url');

        // Debug config values
        Log::info('MoMo Config:', [
            'partnerCode' => $this->partnerCode,
            'accessKey' => $this->accessKey,
            'secretKey' => $this->secretKey ? 'SET' : 'NOT SET',
            'endpoint' => $this->endpoint,
            'redirectUrl' => $this->redirectUrl,
            'ipnUrl' => $this->ipnUrl,
        ]);
    }

    public function createPayment($orderInfo, $amount)
    {
        // Validate config
        if (!$this->partnerCode || !$this->accessKey || !$this->secretKey) {
            Log::error('MoMo config missing');
            throw new \Exception('MoMo configuration is incomplete');
        }

        $orderId = time() . '_' . uniqid();
        $requestId = time() . '_' . uniqid();
        $requestType = "captureWallet";
        $extraData = "";

        // Create signature
        $rawHash = "accessKey=" . $this->accessKey .
            "&amount=" . $amount .
            "&extraData=" . $extraData .
            "&ipnUrl=" . $this->ipnUrl .
            "&orderId=" . $orderId .
            "&orderInfo=" . $orderInfo .
            "&partnerCode=" . $this->partnerCode .
            "&redirectUrl=" . $this->redirectUrl .
            "&requestId=" . $requestId .
            "&requestType=" . $requestType;

        $signature = hash_hmac("sha256", $rawHash, $this->secretKey);

        $data = [
            'partnerCode' => $this->partnerCode,
            'partnerName' => "Test",
            'storeId' => "MomoTestStore",
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $this->redirectUrl,
            'ipnUrl' => $this->ipnUrl,
            'lang' => 'vi',
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature
        ];

        Log::info('MoMo Request Data:', $data);
        Log::info('MoMo Raw Hash:', ['rawHash' => $rawHash]);

        try {
            // Tạm thời disable SSL verification cho development
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->post($this->endpoint, $data);

            Log::info('MoMo Response Status:', ['status' => $response->status()]);
            Log::info('MoMo Response Body:', $response->json() ?? $response->body());

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('MoMo API Error Response:', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('MoMo API returned error: ' . $response->status());
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MoMo Connection Error: ' . $e->getMessage());
            throw new \Exception('Cannot connect to MoMo API: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('MoMo API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifySignature($data)
    {
        $rawHash = "accessKey=" . $this->accessKey .
            "&amount=" . $data['amount'] .
            "&extraData=" . $data['extraData'] .
            "&message=" . $data['message'] .
            "&orderId=" . $data['orderId'] .
            "&orderInfo=" . $data['orderInfo'] .
            "&orderType=" . $data['orderType'] .
            "&partnerCode=" . $data['partnerCode'] .
            "&payType=" . $data['payType'] .
            "&requestId=" . $data['requestId'] .
            "&responseTime=" . $data['responseTime'] .
            "&resultCode=" . $data['resultCode'] .
            "&transId=" . $data['transId'];

        $signature = hash_hmac("sha256", $rawHash, $this->secretKey);

        return $signature === $data['signature'];
    }
}