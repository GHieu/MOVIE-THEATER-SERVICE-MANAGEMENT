<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanh toán thành công</title>
</head>

<body>
    <div class="container">
        <div class="success-page">
            <h1>✅ Thanh toán thành công!</h1>
            <div class="payment-details">
                <p><strong>Mã đơn hàng:</strong> {{ $data['orderId'] ?? 'N/A' }}</p>
                <p><strong>Mã giao dịch:</strong> {{ $data['transId'] ?? 'N/A' }}</p>
                <p><strong>Số tiền:</strong> {{ number_format($data['amount'] ?? 0) }} VNĐ</p>
                <p><strong>Thông tin:</strong> {{ $data['orderInfo'] ?? 'N/A' }}</p>
                <p><strong>Thời gian:</strong> {{ date('d/m/Y H:i:s', $data['responseTime'] ?? time()) }}</p>
            </div>
            <a href="{{ route('momo.payment.form') }}" class="btn">Tạo thanh toán mới</a>
        </div>
    </div>
</body>

</html>