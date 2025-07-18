<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Membership;
use App\Models\Ticket;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Hiển thị danh sách khách hàng thành viên
     */
    public function index(Request $request)
    {
        $query = Customer::with(['membership', 'reviews', 'tickets']);

        // Lọc theo loại thành viên
        if ($request->filled('member_type')) {
            $query->whereHas('membership', function ($q) use ($request) {
                $q->where('member_type', $request->member_type);
            });
        }

        // Lọc theo tên khách hàng
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Lọc theo email
        if ($request->filled('email')) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }

        // Lọc theo số điện thoại
        if ($request->filled('phone')) {
            $query->where('phone', 'like', '%' . $request->phone . '%');
        }

        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $customers = $query->paginate(20);

        // Thêm thông tin thống kê cho mỗi khách hàng
        $customers->getCollection()->transform(function ($customer) {
            $customer->total_tickets = $customer->tickets->count();
            $customer->total_reviews = $customer->reviews->count();
            $customer->total_spent = $customer->tickets->sum('total_price');
            $customer->avg_rating = $customer->reviews->avg('rating');
            return $customer;
        });

        return response()->json([
            'customers' => $customers,
            'filters' => [
                'member_types' => ['Silver', 'Gold', 'Diamond'],
                'sort_options' => [
                    'created_at' => 'Ngày đăng ký',
                    'name' => 'Tên khách hàng',
                    'email' => 'Email',
                    'phone' => 'Số điện thoại'
                ]
            ]
        ]);
    }

    /**
     * Hiển thị chi tiết khách hàng
     */
    public function show($id)
    {
        $customer = Customer::with([
            'membership',
            'reviews.movie:id,title,poster',
            'tickets.showtime.movie:id,title,poster',
            'tickets.showtime.room:id,name',
            'tickets.seat:id,row,number',
            'tickets.promotion:id,description',
            'giftHistories.gift:id,name,point_required'
        ])->findOrFail($id);

        // Tính toán thống kê
        $stats = [
            'total_tickets' => $customer->tickets->count(),
            'total_reviews' => $customer->reviews->count(),
            'total_spent' => $customer->tickets->sum('total_price'),
            'avg_rating' => $customer->reviews->avg('rating'),
            'total_gifts_claimed' => $customer->giftHistories->count(),
            'total_points_used' => $customer->giftHistories->sum('point_required'),
            'favorite_movies' => $customer->tickets->groupBy('showtime.movie.title')
                ->map(function ($group) {
                    return $group->count();
                })
                ->sortDesc()
                ->take(5)
        ];

        return response()->json([
            'customer' => $customer,
            'stats' => $stats
        ]);
    }

    /**
     * Cập nhật thông tin khách hàng
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validatedData = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:2', // Độ dài tối thiểu
                'max:255', // Độ dài tối đa
                'regex:/^[\pL\s\-\.]+$/u' // Ký tự cho phép: chữ, khoảng trắng, -, .
            ],
            'birthdate' => [
                'sometimes',
                'nullable',
                'date', // Ngày hợp lệ
                'date_format:Y-m-d', // Định dạng ngày
                'before_or_equal:today', // Không được là ngày trong tương lai
                'after_or_equal:1955-01-01', // Khoảng thời gian hợp lệ
                // Kiểm tra tuổi tối thiểu/tối đa (ví dụ: 10 <= tuổi <= 70)
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $age = \Carbon\Carbon::parse($value)->age;
                        if ($age < 10 || $age > 70) {
                            $fail('Tuổi phải từ 10 đến 70.');
                        }
                    }
                }
            ],
            'gender' => [
                'sometimes',
                'nullable',
                'in:male,female,other'
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^0[0-9]{7,19}$/', // Định dạng số điện thoại Việt Nam, bắt đầu bằng 0
                Rule::unique('customers')->ignore($customer->id)
            ],
            'address' => [
                'sometimes',
                'nullable',
                'string',
                'min:5',
                'max:500'
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                'min:6',
                'regex:/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', // Định dạng email
                Rule::unique('customers')->ignore($customer->id)
            ],
            'password' => [
                'sometimes',
                'nullable',
                'string',
                'min:8',
                'max:70',
                'regex:/^[A-Za-z0-9!@#$%^&*()_+=-]+$/', // Ký tự cho phép
                'confirmed'
            ],
            // Thông tin thành viên
            'member_type' => [
                'sometimes',
                'nullable',
                'in:Silver,Gold,Diamond'
            ],
            'point' => [
                'sometimes',
                'nullable',
                'numeric', // Là số
                'integer', // Số nguyên
                'min:0',   // Số dương
                'max:1000000' // Khoảng giá trị (ví dụ tối đa 1 triệu)
            ],
            'total_points' => [
                'sometimes',
                'nullable',
                'numeric',
                'integer',
                'min:0',
                'max:10000000'
            ]
        ]);

        // Cập nhật thông tin khách hàng
        $customerData = collect($validatedData)->except(['password', 'member_type', 'point', 'total_points'])->toArray();

        if (isset($validatedData['password'])) {
            $customerData['password'] = Hash::make($validatedData['password']);
        }

        $customer->update($customerData);

        // Cập nhật thông tin thành viên nếu có
        if (isset($validatedData['member_type']) || isset($validatedData['point']) || isset($validatedData['total_points'])) {
            $membershipData = collect($validatedData)->only(['member_type', 'point', 'total_points'])->toArray();

            if ($customer->membership) {
                $customer->membership->update($membershipData);
            } else {
                $customer->membership()->create(array_merge($membershipData, [
                    'customer_id' => $customer->id,
                    'member_type' => $validatedData['member_type'] ?? 'Silver',
                    'point' => $validatedData['point'] ?? 0,
                    'total_points' => $validatedData['total_points'] ?? 0
                ]));
            }
        }

        return response()->json([
            'message' => 'Cập nhật thông tin khách hàng thành công',
            'customer' => $customer->load('membership')
        ]);
    }

    /**
     * Xóa khách hàng
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        // Kiểm tra xem khách hàng có dữ liệu liên quan không
        if ($customer->tickets()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa khách hàng vì có lịch sử đặt vé'
            ], 400);
        }

        $customer->delete();

        return response()->json([
            'message' => 'Xóa khách hàng thành công'
        ]);
    }

    /**
     * Lịch sử đặt vé của khách hàng
     */
    public function ticketHistory($id, Request $request)
    {
        $customer = Customer::findOrFail($id);

        $query = $customer->tickets()->with([
            'showtime.movie:id,title,poster,duration',
            'showtime.room:id,name',
            'seat:id,row,number',
            'promotion:id,name,discount_percentage',
            'details.service:id,name,price'
        ]);

        // Lọc theo trạng thái
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Lọc theo ngày
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Lọc theo phim
        if ($request->filled('movie_id')) {
            $query->whereHas('showtime', function ($q) use ($request) {
                $q->where('movie_id', $request->movie_id);
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(10);

        // Tính toán thống kê
        $stats = [
            'total_tickets' => $customer->tickets->count(),
            'total_spent' => $customer->tickets->sum('total_price'),
            'tickets_by_status' => $customer->tickets->groupBy('status')->map->count(),
            'tickets_by_month' => $customer->tickets
                ->collect() // Ép về Collection
                ->groupBy(function ($ticket) {
                    return $ticket->created_at->format('Y-m');
                })
                ->map->count()
        ];

        return response()->json([
            'tickets' => $tickets,
            'stats' => $stats
        ]);
    }

    /**
     * Lịch sử đánh giá của khách hàng
     */
    public function reviewHistory($id, Request $request)
    {
        $customer = Customer::findOrFail($id);

        $query = $customer->reviews()->with([
            'movie:id,title,poster',
            'customer:id,name'
        ]);

        // Lọc theo rating
        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        // Lọc theo phim
        if ($request->filled('movie_id')) {
            $query->where('movie_id', $request->movie_id);
        }

        // Lọc theo ngày
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(10);

        // Tính toán thống kê
        $stats = [
            'total_reviews' => $customer->reviews->count(),
            'avg_rating' => $customer->reviews->avg('rating'),
            'reviews_by_rating' => $customer->reviews->groupBy('rating')->map->count(),
            'reviews_by_month' => $customer->reviews->collect()->groupBy(function ($review) {
                return $review->created_at->format('Y-m');
            })->map->count()
        ];

        return response()->json([
            'reviews' => $reviews,
            'stats' => $stats
        ]);
    }

    /**
     * Cập nhật điểm thành viên
     */
    public function updatePoints(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        if (!$customer->membership) {
            return response()->json([
                'message' => 'Khách hàng chưa đăng ký thành viên'
            ], 400);
        }

        $validatedData = $request->validate([
            'point' => 'required|integer|min:0',
            'total_points' => 'required|integer|min:0',
            'reason' => 'required|string|max:255'
        ]);

        $oldPoints = $customer->membership->point;
        $oldTotalPoints = $customer->membership->total_points;

        $customer->membership->update([
            'point' => $validatedData['point'],
            'total_points' => $validatedData['total_points']
        ]);

        // Log thay đổi điểm (có thể tạo model PointHistory để lưu lịch sử)

        return response()->json([
            'message' => 'Cập nhật điểm thành viên thành công',
            'membership' => $customer->membership,
            'changes' => [
                'point_change' => $validatedData['point'] - $oldPoints,
                'total_points_change' => $validatedData['total_points'] - $oldTotalPoints,
                'reason' => $validatedData['reason']
            ]
        ]);
    }

    /**
     * Thống kê tổng quan khách hàng
     */
    public function statistics()
    {
        $stats = [
            'total_customers' => Customer::count(),
            'total_members' => Customer::has('membership')->count(),
            'members_by_type' => Customer::join('memberships', 'customers.id', '=', 'memberships.customer_id')
                ->groupBy('memberships.member_type')
                ->selectRaw('memberships.member_type, count(*) as count')
                ->pluck('count', 'member_type'),
            'new_customers_this_month' => Customer::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'top_customers_by_spending' => Customer::with('membership')
                ->withSum('tickets', 'total_price')
                ->orderBy('tickets_sum_total_price', 'desc')
                ->take(10)
                ->get(),
            'customer_growth_by_month' => Customer::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->take(12)
                ->get()
        ];

        return response()->json($stats);
    }
}