<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Log;

class VNPayService
{
    private $tmnCode;
    private $hashSecret;
    private $url;
    private $returnUrl;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code');
        $this->hashSecret = config('vnpay.hash_secret');
        $this->url = config('vnpay.url');
        $this->returnUrl = config('vnpay.return_url');
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPaymentUrl(Ticket $ticket, $ipAddr = null)
    {
        $vnp_TxnRef = 'TICKET_' . $ticket->id . '_' . time();
        $vnp_OrderInfo = "Thanh toan ve xem phim #" . $ticket->id;
        $vnp_OrderType = "billpayment";
        $vnp_Amount = $ticket->total_price * 100;
        $vnp_Locale = "vn";
        $vnp_BankCode = "";
        $vnp_IpAddr = $ipAddr ?? request()->ip();

        // Lưu vnpay_order_id
        $ticket->update(['vnpay_order_id' => $vnp_TxnRef]);

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->tmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $this->returnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

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

        $vnp_Url = $this->url . "?" . $query;
        if (isset($this->hashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->hashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        Log::info("VNPay payment URL created for ticket: {$ticket->id}");

        return $vnp_Url;
    }

    /**
     * Xác thực callback từ VNPay
     */
    public function validateCallback($requestData)
    {
        $vnp_SecureHash = $requestData['vnp_SecureHash'] ?? '';

        $inputData = array();
        foreach ($requestData as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->hashSecret);

        return $secureHash == $vnp_SecureHash;
    }

    /**
     * Xử lý kết quả thanh toán
     */
    public function handlePaymentResult($requestData)
    {
        if (!$this->validateCallback($requestData)) {
            return [
                'success' => false,
                'message' => 'Chữ ký không hợp lệ'
            ];
        }

        $vnpayOrderId = $requestData['vnp_TxnRef'];
        $ticket = Ticket::where('vnpay_order_id', $vnpayOrderId)->first();

        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy vé'
            ];
        }

        $responseCode = $requestData['vnp_ResponseCode'];
        $transactionNo = $requestData['vnp_TransactionNo'] ?? null;

        if ($responseCode == '00') {
            // Thanh toán thành công
            $ticket->update([
                'status' => 'paid',
                'vnpay_transaction_no' => $transactionNo,
                'paid_at' => now()
            ]);

            Log::info("Payment successful for ticket: {$ticket->id}");

            return [
                'success' => true,
                'message' => 'Thanh toán thành công',
                'ticket' => $ticket
            ];
        } else {
            // Thanh toán thất bại
            Log::info("Payment failed for ticket: {$ticket->id}, Response code: {$responseCode}");

            return [
                'success' => false,
                'message' => 'Thanh toán thất bại',
                'ticket' => $ticket,
                'response_code' => $responseCode
            ];
        }
    }
}