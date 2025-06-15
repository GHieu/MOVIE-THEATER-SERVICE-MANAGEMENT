<div>
    <form action="/payment/momo" method="POST">
        @csrf
        Số tiền: <input type="number" name="amount" value="50000"><br>
        <button type="submit">Thanh toán MoMo thử</button>
    </form>
</div>