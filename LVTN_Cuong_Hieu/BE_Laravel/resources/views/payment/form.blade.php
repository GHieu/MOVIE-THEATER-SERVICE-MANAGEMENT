<!DOCTYPE html>
<html>

<head>
    <title>Thanh toán MoMo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4>Thanh toán MoMo</h4>
                    </div>
                    <div class="card-body">
                        @if(session('error'))
                        <div class="alert alert-danger">{{ session('error') }}</div>
                        @endif

                        <form action="{{ route('momo.payment') }}" method="POST">
                            @csrf
                            <div class="mb-3">
                                <label for="amount" class="form-label">Số tiền (VNĐ)</label>
                                <input type="number" class="form-control" id="amount" name="amount" min="1000" required
                                    value="{{ old('amount') }}">
                            </div>

                            <div class="mb-3">
                                <label for="order_info" class="form-label">Thông tin đơn hàng</label>
                                <input type="text" class="form-control" id="order_info" name="order_info" required
                                    value="{{ old('order_info', 'Thanh toán đơn hàng') }}">
                            </div>

                            <button type="submit" class="btn btn-primary w-100">
                                Thanh toán với MoMo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>