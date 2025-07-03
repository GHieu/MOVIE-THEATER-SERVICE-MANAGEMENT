<?php

namespace App\Services;

class VNPayService
{
    protected $tmnCode;
    protected $hashSecret;
    protected $url;
    protected $returnUrl;
    protected $version;
    protected $command;
    protected $currencyCode;
    protected $locale;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code');
        $this->hashSecret = config('vnpay.hash_secret');
        $this->url = config('vnpay.url');
        $this->returnUrl = config('vnpay.return_url');
        $this->version = config('vnpay.version');
        $this->command = config('vnpay.command');
        $this->currencyCode = config('vnpay.currency_code');
        $this->locale = config('vnpay.locale');
    }

    public function createPaymentUrl($orderId, $amount, $orderInfo, $ipAddr)
    {
        $inputData = array(
            "vnp_Version" => $this->version,
            "vnp_TmnCode" => $this->tmnCode,
            "vnp_Amount" => $amount * 100, // VNPay yêu cầu số tiền * 100
            "vnp_Command" => $this->command,
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => $this->currencyCode,
            "vnp_IpAddr" => $ipAddr,
            "vnp_Locale" => $this->locale,
            "vnp_OrderInfo" => $orderInfo,
            "vnp_OrderType" => 'other',
            "vnp_ReturnUrl" => $this->returnUrl,
            "vnp_TxnRef" => $orderId,
        );

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnpUrl = $this->url . "?" . $query;
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->hashSecret);
        $vnpUrl .= 'vnp_SecureHash=' . $vnpSecureHash;

        return $vnpUrl;
    }

    public function validateResponse($inputData)
    {
        $vnpSecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);

        $hashData = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->hashSecret);

        return $secureHash === $vnpSecureHash;
    }
}