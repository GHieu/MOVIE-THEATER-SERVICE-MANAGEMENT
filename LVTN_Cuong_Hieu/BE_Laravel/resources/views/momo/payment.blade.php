<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanh toán MoMo</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .container {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .header h1 {
        color: #333;
        margin-bottom: 0.5rem;
    }

    .momo-logo {
        width: 80px;
        height: 80px;
        background: #ae2070;
        border-radius: 50%;
        margin: 0 auto 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.5rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e1e5e9;
        border-radius: 10px;
        font-size: 16px;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus {
        outline: none;
        border-color: #ae2070;
    }

    .btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #ae2070 0%, #d63384 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(174, 32, 112, 0.3);
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .loading {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .result {
        margin-top: 1.5rem;
        padding: 1rem;
        border-radius: 10px;
        display: none;
    }

    .result.success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }

    .result.error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }

    .payment-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        margin-top: 1rem;
    }

    .payment-info h3 {
        color: #333;
        margin-bottom: 0.5rem;
    }

    .payment-info p {
        margin: 0.25rem 0;
        color: #666;
    }

    .pay-now-btn {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        margin-top: 1rem;
    }

    .pay-now-btn:hover {
        box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
    }

    .alert {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 10px;
    }

    .alert-success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }

    .alert-error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    </style>
</head>

<body>
    <div class="container">
        @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
        @endif

        @if(session('error'))
        <div class="alert alert-error">
            {{ session('error') }}
        </div>
        @endif

        <div class="header">
            <div class="momo-logo">MoMo</div>
            <h1>Thanh toán MoMo</h1>
            <p>Tích hợp thanh toán an toàn và nhanh chóng</p>
        </div>

        <!-- Form for Web submission (redirect) -->
        <form id="webPaymentForm" action="{{ route('momo.create.web') }}" method="POST" style="display: none;">
            @csrf
            <input type="hidden" name="amount" id="webAmount">
            <input type="hidden" name="order_info" id="webOrderInfo">
        </form>

        <!-- Main form for JavaScript/API -->
        <form id="paymentForm">
            @csrf
            <div class="form-group">
                <label for="amount">Số tiền (VNĐ)</label>
                <input type="number" id="amount" name="amount" min="1000" step="1000" value="50000" required>
            </div>

            <div class="form-group">
                <label for="orderInfo">Thông tin đơn hàng</label>
                <input type="text" id="orderInfo" name="order_info" value="Test thanh toán" required>
            </div>

            <button type="submit" class="btn" id="submitBtn">
                <span id="btnText">Tạo thanh toán</span>
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                </div>
            </button>
        </form>

        <div id="result" class="result"></div>

        <div id="paymentInfo" class="payment-info" style="display: none;">
            <h3>Thông tin thanh toán</h3>
            <p><strong>Mã đơn hàng:</strong> <span id="orderIdDisplay"></span></p>
            <p><strong>Số tiền:</strong> <span id="amountDisplay"></span> VNĐ</p>
            <button id="payNowBtn" class="btn pay-now-btn">Thanh toán ngay</button>
            <button id="webPayBtn" class="btn" style="margin-top: 0.5rem; background: #6c757d;">Thanh toán trên
                web</button>
        </div>
    </div>

    <script>
    const form = document.getElementById('paymentForm');
    const webForm = document.getElementById('webPaymentForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const paymentInfo = document.getElementById('paymentInfo');
    const payNowBtn = document.getElementById('payNowBtn');
    const webPayBtn = document.getElementById('webPayBtn');

    let currentPayUrl = '';
    let currentFormData = {};

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            amount: formData.get('amount'),
            order_info: formData.get('order_info')
        };

        // Store current form data
        currentFormData = data;

        // Show loading
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'block';
        result.style.display = 'none';
        paymentInfo.style.display = 'none';

        try {
            const response = await axios.post('/api/momo/create-payment', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute(
                        'content')
                }
            });

            if (response.data.success) {
                // Show success
                result.className = 'result success';
                result.innerHTML = `
                    <h4>✅ Tạo thanh toán thành công!</h4>
                    <p>${response.data.message}</p>
                `;
                result.style.display = 'block';

                // Show payment info
                document.getElementById('orderIdDisplay').textContent = response.data.orderId;
                document.getElementById('amountDisplay').textContent = parseInt(data.amount)
                .toLocaleString();
                paymentInfo.style.display = 'block';

                // Store payment URL
                currentPayUrl = response.data.payUrl;

            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra');
            }

        } catch (error) {
            console.error('Payment error:', error);

            // Show error
            result.className = 'result error';
            result.innerHTML = `
                <h4>❌ Lỗi tạo thanh toán!</h4>
                <p>${error.response?.data?.message || error.message}</p>
                <p class="small">Có thể thử phương thức thanh toán web bên dưới</p>
            `;
            result.style.display = 'block';

        } finally {
            // Hide loading
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            loading.style.display = 'none';
        }
    });

    // Pay now button - open in new tab
    payNowBtn.addEventListener('click', () => {
        if (currentPayUrl) {
            window.open(currentPayUrl, '_blank');
        }
    });

    // Web payment button - submit form normally
    webPayBtn.addEventListener('click', () => {
        if (currentFormData.amount && currentFormData.order_info) {
            document.getElementById('webAmount').value = currentFormData.amount;
            document.getElementById('webOrderInfo').value = currentFormData.order_info;
            webForm.submit();
        }
    });

    // Format number input
    document.getElementById('amount').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value && value < 1000) {
            e.target.setCustomValidity('Số tiền tối thiểu là 1,000 VNĐ');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Set up axios defaults
    axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute(
        'content');
    </script>
</body>

</html>