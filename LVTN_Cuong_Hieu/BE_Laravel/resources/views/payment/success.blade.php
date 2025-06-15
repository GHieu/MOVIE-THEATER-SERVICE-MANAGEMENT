<!DOCTYPE html>
<html>

<head>
    <title>Thanh toán thành công</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body text-center">
                        <div class="text-success mb-3">
                            <i class="fas fa-check-circle" style="font-size: 4rem;"></i>
                        </div>
                        <h3 class="text-success">Thanh toán thành công!</h3>
                        <p>Mã giao dịch: <strong>{{ $data['transId'] ?? 'N/A' }}</strong></p>
                        <p>Số tiền: <strong>{{ number_format($data['amount'] ?? 0) }} VNĐ</strong></p>
                        <a href="/" class="btn btn-primary">Về trang chủ</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>