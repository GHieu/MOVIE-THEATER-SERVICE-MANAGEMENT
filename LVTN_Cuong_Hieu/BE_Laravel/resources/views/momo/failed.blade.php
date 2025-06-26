<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanh toán thất bại</title>
</head>

<body>
    <div class="container">
        <div class="error-page">
            <h1>❌ Thanh toán thất bại!</h1>
            <div class="error-details">
                <p><strong>Mã lỗi:</strong> {{ $data['resultCode'] ?? 'N/A' }}</p>
                <p><strong>Thông báo:</strong> {{ $data['message'] ?? 'Có lỗi xảy ra' }}</p>
                <p><strong>Mã đơn hàng:</strong> {{ $data['orderId'] ?? 'N/A' }}</p>
            </div>
            <a href="{{ route('momo.payment.form') }}" class="btn">Thử lại</a>
        </div>
    </div>
</body>

</html>