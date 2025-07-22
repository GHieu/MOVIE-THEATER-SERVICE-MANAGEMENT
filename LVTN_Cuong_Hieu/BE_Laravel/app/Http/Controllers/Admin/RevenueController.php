<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Ticket;
use App\Models\ServiceOrder;
use App\Models\Movie;
use App\Models\Room;
use App\Models\Showtime;
use App\Models\Membership;
use App\Models\GiftHistory;
use App\Models\Gift;
use App\Models\Customer;
use App\Models\Promotion;
use App\Models\Service;



class RevenueController extends Controller
{
    /**
     * Thống kê doanh thu theo ngày
     * GET /api/revenue/daily?date=2024-12-25
     */
    public function dailyRevenue(Request $request)
    {
        $request->validate([
            'date' => [
                'nullable',
                'date_format:Y-m-d', // Kiểm tra định dạng ngày tháng hợp lệ
                'date',              // Kiểm tra ngày hợp lệ
                'before_or_equal:today' // Ngày không vượt quá hôm nay (quá khứ/hiện tại)
            ]
        ]);
        try {
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));

            // Validate date format
            if (!Carbon::hasFormat($date, 'Y-m-d')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid date format. Use YYYY-MM-DD'
                ], 400);
            }

            // Doanh thu từ vé
            $ticketRevenue = Ticket::whereDate('created_at', $date)
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu từ dịch vụ (sử dụng tickets.created_at thay vì service_orders.created_at)
            $serviceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereDate('tickets.created_at', $date)
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Số lượng vé bán
            $ticketCount = Ticket::whereDate('created_at', $date)
                ->where('status', 'paid')
                ->count();

            // Thống kê theo giờ
            $hourlyStats = Ticket::whereDate('created_at', $date)
                ->where('status', 'paid')
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as ticket_count')
                )
                ->groupBy('hour')
                ->orderBy('hour')
                ->get();

            // Thống kê dịch vụ chi tiết
            $serviceStatsDaily = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereDate('tickets.created_at', $date)
                ->where('tickets.status', 'paid')
                ->select(
                    'services.name as service_name',
                    DB::raw('SUM(service_orders.quantity) as total_quantity'),
                    DB::raw('SUM(service_orders.quantity * services.price) as total_revenue')
                )
                ->groupBy('services.id', 'services.name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'ticket_revenue' => (float) $ticketRevenue,
                    'service_revenue' => (float) $serviceRevenue,
                    'total_revenue' => (float) ($ticketRevenue + $serviceRevenue),
                    'ticket_count' => $ticketCount,
                    'hourly_stats' => $hourlyStats,
                    'service_stats' => $serviceStatsDaily
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving daily revenue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê doanh thu theo tháng
     * GET /api/revenue/monthly?month=2024-12
     */
    public function monthlyRevenue(Request $request)
    {
        $request->validate([
            'month' => [
                'nullable',
                'regex:/^\d{4}\-(0[1-9]|1[0-2])$/', // Định dạng YYYY-MM
            ]
        ]);
        try {
            $month = $request->get('month', Carbon::now()->format('Y-m'));

            // Validate month format
            if (!Carbon::hasFormat($month . '-01', 'Y-m-d')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid month format. Use YYYY-MM'
                ], 400);
            }

            $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m', $month)->endOfMonth();

            // Doanh thu từ vé
            $ticketRevenue = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu từ dịch vụ
            $serviceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereBetween('tickets.created_at', [$startDate, $endDate])
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Số lượng vé bán
            $ticketCount = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->count();

            // Thống kê theo ngày trong tháng
            $dailyStats = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as ticket_count')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'month' => $month,
                    'ticket_revenue' => (float) $ticketRevenue,
                    'service_revenue' => (float) $serviceRevenue,
                    'total_revenue' => (float) ($ticketRevenue + $serviceRevenue),
                    'ticket_count' => $ticketCount,
                    'daily_stats' => $dailyStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving monthly revenue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê doanh thu theo năm
     * GET /api/revenue/yearly?year=2024
     */
    public function yearlyRevenue(Request $request)
    {
        $request->validate([
            'year' => [
                'nullable',
                'digits:4',      // Độ dài 4 ký tự
                'integer',       // Số nguyên
                'min:2000',      // Khoảng giá trị (ví dụ từ năm 2000)
                'max:' . date('Y') // Không vượt quá năm hiện tại
            ]
        ]);
        try {
            $year = $request->get('year', Carbon::now()->format('Y'));

            // Validate year format
            if (!is_numeric($year) || strlen($year) != 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid year format. Use YYYY'
                ], 400);
            }

            $startDate = Carbon::createFromDate($year, 1, 1)->startOfYear();
            $endDate = Carbon::createFromDate($year, 12, 31)->endOfYear();

            // Doanh thu từ vé
            $ticketRevenue = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu từ dịch vụ
            $serviceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereBetween('tickets.created_at', [$startDate, $endDate])
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Số lượng vé bán
            $ticketCount = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->count();

            // Thống kê theo tháng trong năm
            $monthlyStats = Ticket::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'paid')
                ->select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as ticket_count')
                )
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'year' => $year,
                    'ticket_revenue' => (float) $ticketRevenue,
                    'service_revenue' => (float) $serviceRevenue,
                    'total_revenue' => (float) ($ticketRevenue + $serviceRevenue),
                    'ticket_count' => $ticketCount,
                    'monthly_stats' => $monthlyStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving yearly revenue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê doanh thu theo khoảng thời gian tùy chọn
     * GET /api/revenue/range?start_date=2024-12-01&end_date=2024-12-31
     */
    public function rangeRevenue(Request $request)
    {
        $request->validate([
            'start_date' => [
                'required',
                'date_format:Y-m-d', // Định dạng ngày tháng hợp lệ
                'date',              // Ngày hợp lệ
                'before_or_equal:end_date', // Start <= End
            ],
            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'date',
                'after_or_equal:start_date',
                'before_or_equal:today' // Không vượt quá hôm nay
            ]
        ]);
        try {
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            // Validate required parameters
            if (!$startDate || !$endDate) {
                return response()->json([
                    'success' => false,
                    'message' => 'start_date and end_date are required'
                ], 400);
            }

            // Validate date format
            if (!Carbon::hasFormat($startDate, 'Y-m-d') || !Carbon::hasFormat($endDate, 'Y-m-d')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid date format. Use YYYY-MM-DD'
                ], 400);
            }

            $start = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
            $end = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

            // Validate date range
            if ($start->gt($end)) {
                return response()->json([
                    'success' => false,
                    'message' => 'start_date must be before end_date'
                ], 400);
            }

            // Doanh thu từ vé
            $ticketRevenue = Ticket::whereBetween('created_at', [$start, $end])
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu từ dịch vụ
            $serviceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereBetween('tickets.created_at', [$start, $end])
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Số lượng vé bán
            $ticketCount = Ticket::whereBetween('created_at', [$start, $end])
                ->where('status', 'paid')
                ->count();

            // Thống kê theo ngày
            $dailyStats = Ticket::whereBetween('created_at', [$start, $end])
                ->where('status', 'paid')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as ticket_count')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'ticket_revenue' => (float) $ticketRevenue,
                    'service_revenue' => (float) $serviceRevenue,
                    'total_revenue' => (float) ($ticketRevenue + $serviceRevenue),
                    'ticket_count' => $ticketCount,
                    'daily_stats' => $dailyStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving range revenue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê tổng quan doanh thu
     * GET /api/revenue/overview
     */
    public function overview()
    {
        try {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $thisYear = Carbon::now()->startOfYear();

            // Doanh thu vé hôm nay
            $todayRevenue = Ticket::whereDate('created_at', $today)
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu vé tháng này
            $monthRevenue = Ticket::where('created_at', '>=', $thisMonth)
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu vé năm này
            $yearRevenue = Ticket::where('created_at', '>=', $thisYear)
                ->where('status', 'paid')
                ->sum('total_price');

            // Doanh thu dịch vụ hôm nay
            $todayServiceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereDate('tickets.created_at', $today)
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Doanh thu dịch vụ tháng này
            $monthServiceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->where('tickets.created_at', '>=', $thisMonth)
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Doanh thu dịch vụ năm này
            $yearServiceRevenue = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->where('tickets.created_at', '>=', $thisYear)
                ->where('tickets.status', 'paid')
                ->sum(DB::raw('service_orders.quantity * services.price'));

            // Top 5 ngày có doanh thu cao nhất trong tháng
            $topDays = Ticket::where('created_at', '>=', $thisMonth)
                ->where('status', 'paid')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as ticket_count')
                )
                ->groupBy('date')
                ->orderBy('revenue', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'today_revenue' => (float) ($todayRevenue + $todayServiceRevenue),
                    'today_ticket_revenue' => (float) $todayRevenue,
                    'today_service_revenue' => (float) $todayServiceRevenue,
                    'month_revenue' => (float) ($monthRevenue + $monthServiceRevenue),
                    'month_ticket_revenue' => (float) $monthRevenue,
                    'month_service_revenue' => (float) $monthServiceRevenue,
                    'year_revenue' => (float) ($yearRevenue + $yearServiceRevenue),
                    'year_ticket_revenue' => (float) $yearRevenue,
                    'year_service_revenue' => (float) $yearServiceRevenue,
                    'top_days' => $topDays
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving overview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê chi tiết dịch vụ theo ngày
     * GET /api/revenue/service-details?date=2024-12-25
     */
    public function serviceDetails(Request $request)
    {
        $request->validate([
            'date' => [
                'nullable',
                'date_format:Y-m-d',
                'date',
                'before_or_equal:today'
            ]
        ]);
        try {
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));

            // Validate date format
            if (!Carbon::hasFormat($date, 'Y-m-d')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid date format. Use YYYY-MM-DD'
                ], 400);
            }

            // Thống kê chi tiết từng dịch vụ (sử dụng tickets.created_at)
            $serviceDetails = ServiceOrder::join('services', 'service_orders.service_id', '=', 'services.id')
                ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
                ->whereDate('tickets.created_at', $date)
                ->where('tickets.status', 'paid')
                ->select(
                    'services.id',
                    'services.name',
                    'services.price as unit_price',
                    DB::raw('SUM(service_orders.quantity) as total_quantity'),
                    DB::raw('SUM(service_orders.quantity * services.price) as total_revenue')
                )
                ->groupBy('services.id', 'services.name', 'services.price')
                ->orderBy('total_revenue', 'desc')
                ->get();

            // Tổng doanh thu dịch vụ
            $totalServiceRevenue = $serviceDetails->sum('total_revenue');

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'total_service_revenue' => (float) $totalServiceRevenue,
                    'service_details' => $serviceDetails
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving service details: ' . $e->getMessage()
            ], 500);
        }
    }









    /**
     * Top 10 phim có doanh thu cao nhất
     * GET /api/analytics/top-movies?period=month&limit=10
     */
    public function topMoviesByRevenue(Request $request)
    {
        $period = $request->get('period', 'all'); // all, year, month, week
        $limit = $request->get('limit', 10);

        $query = Movie::join('showtimes', 'movies.id', '=', 'showtimes.movie_id')
            ->join('tickets', 'showtimes.id', '=', 'tickets.showtime_id')
            ->where('tickets.status', 'paid');

        // Thêm điều kiện thời gian
        switch ($period) {
            case 'year':
                $query->whereYear('tickets.created_at', now()->year);
                break;
            case 'month':
                $query->whereMonth('tickets.created_at', now()->month)
                    ->whereYear('tickets.created_at', now()->year);
                break;
            case 'week':
                $query->whereBetween('tickets.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
        }

        $topMovies = $query->select(
            'movies.id',
            'movies.title',
            'movies.poster',
            'movies.genre',
            'movies.release_date',
            DB::raw('SUM(tickets.total_price) as total_revenue'),
            DB::raw('COUNT(tickets.id) as total_tickets'),
            DB::raw('COUNT(DISTINCT showtimes.id) as total_showtimes'),
            DB::raw('AVG(tickets.total_price) as avg_ticket_price')
        )
            ->groupBy('movies.id', 'movies.title', 'movies.poster', 'movies.genre', 'movies.release_date')
            ->orderBy('total_revenue', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topMovies
        ]);
    }

    /**
     * Thống kê doanh thu theo từng phòng chiếu
     * GET /api/analytics/room-performance
     */
    public function roomPerformance(Request $request)
    {
        $period = $request->get('period', 'month');

        $query = Room::join('showtimes', 'rooms.id', '=', 'showtimes.room_id')
            ->join('tickets', 'showtimes.id', '=', 'tickets.showtime_id')
            ->where('tickets.status', 'paid');

        switch ($period) {
            case 'year':
                $query->whereYear('tickets.created_at', now()->year);
                break;
            case 'month':
                $query->whereMonth('tickets.created_at', now()->month)
                    ->whereYear('tickets.created_at', now()->year);
                break;
        }

        $roomStats = $query->select(
            'rooms.id',
            'rooms.name',
            'rooms.type',
            'rooms.seat_count',
            DB::raw('SUM(tickets.total_price) as total_revenue'),
            DB::raw('COUNT(tickets.id) as total_tickets'),
            DB::raw('COUNT(DISTINCT showtimes.id) as total_showtimes'),
            DB::raw('ROUND((COUNT(tickets.id) * 100.0) / (COUNT(DISTINCT showtimes.id) * rooms.seat_count), 2) as occupancy_rate')
        )
            ->groupBy('rooms.id', 'rooms.name', 'rooms.type', 'rooms.seat_count')
            ->orderBy('total_revenue', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roomStats
        ]);
    }

    public function promotionEffectiveness(Request $request)
    {
        // Doanh thu từ vé có khuyến mãi
        $promotionTickets = Ticket::join('promotions', 'tickets.promotion_id', '=', 'promotions.id')
            ->where('tickets.status', 'paid')
            ->select(
                'promotions.id',
                'promotions.title',  // Changed from 'name' to 'title'
                'promotions.discount_percent',  // Changed from 'discount_percentage' to 'discount_percent'
                'promotions.start_date',
                'promotions.end_date',
                DB::raw('COUNT(tickets.id) as tickets_used'),
                DB::raw('SUM(tickets.total_price) as revenue_after_discount'),
                DB::raw('SUM(tickets.total_price / (1 - promotions.discount_percent/100)) as revenue_before_discount')  // Updated column name
            )
            ->groupBy('promotions.id', 'promotions.title', 'promotions.discount_percent', 'promotions.start_date', 'promotions.end_date')  // Updated groupBy
            ->get();

        // Tính toán ROI cho từng khuyến mãi
        $promotionStats = $promotionTickets->map(function ($promo) {
            $discount_amount = $promo->revenue_before_discount - $promo->revenue_after_discount;
            $promo->discount_amount = $discount_amount;
            $promo->avg_ticket_value = $promo->tickets_used > 0 ? $promo->revenue_after_discount / $promo->tickets_used : 0;
            return $promo;
        });

        return response()->json([
            'success' => true,
            'data' => $promotionStats
        ]);
    }

    /**
     * Phân tích khách hàng VIP và membership
     * GET /api/analytics/customer-analysis
     */
    public function customerAnalysis(Request $request)
    {
        // Phân tích theo loại membership
        $membershipStats = Membership::join('customers', 'memberships.customer_id', '=', 'customers.id')
            ->leftJoin('tickets', 'customers.id', '=', 'tickets.customer_id')
            ->where('tickets.status', 'paid')
            ->select(
                'memberships.member_type',
                DB::raw('COUNT(DISTINCT customers.id) as customer_count'),
                DB::raw('SUM(tickets.total_price) as total_revenue'),
                DB::raw('AVG(tickets.total_price) as avg_spending_per_ticket'),
                DB::raw('COUNT(tickets.id) as total_tickets'),
                DB::raw('ROUND(COUNT(tickets.id) / COUNT(DISTINCT customers.id), 2) as avg_tickets_per_customer')
            )
            ->groupBy('memberships.member_type')
            ->get();

        // Top khách hàng chi tiêu nhiều nhất
        $topCustomers = Customer::join('tickets', 'customers.id', '=', 'tickets.customer_id')
            ->leftJoin('memberships', 'customers.id', '=', 'memberships.customer_id')
            ->where('tickets.status', 'paid')
            ->select(
                'customers.id',
                'customers.name',
                'customers.email',
                'memberships.member_type',
                'memberships.point',
                DB::raw('SUM(tickets.total_price) as total_spent'),
                DB::raw('COUNT(tickets.id) as total_tickets'),
                DB::raw('AVG(tickets.total_price) as avg_ticket_value')
            )
            ->groupBy('customers.id', 'customers.name', 'customers.email', 'memberships.member_type', 'memberships.point')
            ->orderBy('total_spent', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'membership_stats' => $membershipStats,
                'top_customers' => $topCustomers
            ]
        ]);
    }

    /**
     * Thống kê đổi quà và điểm thưởng
     * GET /api/analytics/loyalty-program
     */
    public function loyaltyProgramAnalysis()
    {
        // Thống kê đổi quà
        $giftStats = GiftHistory::join('gifts', 'gift_history.gift_id', '=', 'gifts.id')
            ->join('customers', 'gift_history.customer_id', '=', 'customers.id')
            ->select(
                'gifts.name as gift_name',
                'gifts.point_required',
                DB::raw('COUNT(*) as exchange_count'),
                DB::raw('SUM(gifts.point_required) as total_points_used'),
                DB::raw('AVG(gifts.point_required) as avg_points_per_exchange')
            )
            ->groupBy('gifts.id', 'gifts.name', 'gifts.point_required')
            ->orderBy('exchange_count', 'desc')
            ->get();

        // Phân tích điểm tích lũy
        $pointsAnalysis = Membership::select(
            'member_type',
            DB::raw('COUNT(*) as member_count'),
            DB::raw('SUM(point) as total_points'),
            DB::raw('AVG(point) as avg_points'),
            DB::raw('MAX(point) as max_points'),
            DB::raw('MIN(point) as min_points')
        )
            ->groupBy('member_type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'gift_exchange_stats' => $giftStats,
                'points_analysis' => $pointsAnalysis
            ]
        ]);
    }

    /**
     * Thống kê theo khung giờ (Rush hours analysis)
     * GET /api/analytics/time-slot-analysis
     */
    public function timeSlotAnalysis(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));

        $hourlyStats = Showtime::join('tickets', 'showtimes.id', '=', 'tickets.showtime_id')
            ->where('tickets.status', 'paid')
            ->whereDate('showtimes.start_time', $date)
            ->select(
                DB::raw('HOUR(showtimes.start_time) as hour'),
                DB::raw('COUNT(tickets.id) as ticket_count'),
                DB::raw('SUM(tickets.total_price) as revenue'),
                DB::raw('COUNT(DISTINCT showtimes.id) as showtime_count')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Phân loại khung giờ
        $timeSlots = [
            'morning' => $hourlyStats->whereBetween('hour', [6, 11]),
            'afternoon' => $hourlyStats->whereBetween('hour', [12, 17]),
            'evening' => $hourlyStats->whereBetween('hour', [18, 22]),
            'night' => $hourlyStats->where('hour', '>', 22)->merge($hourlyStats->where('hour', '<', 6))
        ];

        $timeSlotSummary = collect($timeSlots)->map(function ($slots, $period) {
            return [
                'period' => $period,
                'total_tickets' => $slots->sum('ticket_count'),
                'total_revenue' => $slots->sum('revenue'),
                'avg_revenue_per_hour' => $slots->count() > 0 ? $slots->avg('revenue') : 0
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'hourly_stats' => $hourlyStats,
                'time_slot_summary' => $timeSlotSummary->values()
            ]
        ]);
    }

    /**
     * Doanh thu theo thể loại phim
     * GET /api/analytics/genre-performance
     */
    public function genrePerformance(Request $request)
    {
        $period = $request->get('period', 'month');

        $query = DB::table('movies')
            ->join('showtimes', 'movies.id', '=', 'showtimes.movie_id')
            ->join('tickets', 'showtimes.id', '=', 'tickets.showtime_id')
            ->where('tickets.status', 'paid');

        switch ($period) {
            case 'year':
                $query->whereYear('tickets.created_at', now()->year);
                break;
            case 'month':
                $query->whereMonth('tickets.created_at', now()->month)
                    ->whereYear('tickets.created_at', now()->year);
                break;
        }

        $genreStats = $query->select(
            'movies.genre',
            DB::raw('COUNT(DISTINCT movies.id) as movie_count'),
            DB::raw('COUNT(tickets.id) as total_tickets'),
            DB::raw('SUM(tickets.total_price) as total_revenue'),
            DB::raw('AVG(tickets.total_price) as avg_ticket_price')
        )
            ->groupBy('movies.genre')
            ->orderBy('total_revenue', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $genreStats
        ]);
    }

    /**
     * Phân tích xu hướng theo tuần/tháng
     * GET /api/analytics/trend-analysis?type=weekly
     */
    public function trendAnalysis(Request $request)
    {
        $type = $request->get('type', 'weekly'); // weekly, monthly

        if ($type === 'weekly') {
            // 12 tuần gần nhất
            $trends = collect(range(11, 0))->map(function ($weeksAgo) {
                $startOfWeek = now()->subWeeks($weeksAgo)->startOfWeek();
                $endOfWeek = now()->subWeeks($weeksAgo)->endOfWeek();

                $revenue = Ticket::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->where('status', 'paid')
                    ->sum('total_price');

                $tickets = Ticket::whereBetween('created_at', [$startOfWeek, $endOfWeek])
                    ->where('status', 'paid')
                    ->count();

                return [
                    'period' => $startOfWeek->format('Y-m-d') . ' to ' . $endOfWeek->format('Y-m-d'),
                    'week' => $startOfWeek->format('W'),
                    'revenue' => (float) $revenue,
                    'tickets' => $tickets,
                    'avg_ticket_price' => $tickets > 0 ? $revenue / $tickets : 0
                ];
            });
        } else {
            // 12 tháng gần nhất
            $trends = collect(range(11, 0))->map(function ($monthsAgo) {
                $month = now()->subMonths($monthsAgo);

                $revenue = Ticket::whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->where('status', 'paid')
                    ->sum('total_price');

                $tickets = Ticket::whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->where('status', 'paid')
                    ->count();

                return [
                    'period' => $month->format('Y-m'),
                    'revenue' => (float) $revenue,
                    'tickets' => $tickets,
                    'avg_ticket_price' => $tickets > 0 ? $revenue / $tickets : 0
                ];
            });
        }

        return response()->json([
            'success' => true,
            'data' => $trends
        ]);
    }

    /**
     * Dashboard tổng quan nâng cao
     * GET /api/analytics/advanced-dashboard
     */
    public function advancedDashboard()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // So sánh với hôm qua
        $todayRevenue = Ticket::whereDate('created_at', $today)->where('status', 'paid')->sum('total_price');
        $yesterdayRevenue = Ticket::whereDate('created_at', $yesterday)->where('status', 'paid')->sum('total_price');

        // So sánh với tháng trước
        $thisMonthRevenue = Ticket::where('created_at', '>=', $thisMonth)->where('status', 'paid')->sum('total_price');
        $lastMonthRevenue = Ticket::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->where('status', 'paid')->sum('total_price');

        // Thống kê nhanh
        $totalCustomers = Customer::count();
        $activeMembers = Membership::whereNotNull('point')->where('point', '>', 0)->count();
        $totalMoviesThisMonth = Movie::whereMonth('created_at', now()->month)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'revenue_comparison' => [
                    'today' => (float) $todayRevenue,
                    'yesterday' => (float) $yesterdayRevenue,
                    'daily_growth' => $yesterdayRevenue > 0 ? (($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100 : 0,
                    'this_month' => (float) $thisMonthRevenue,
                    'last_month' => (float) $lastMonthRevenue,
                    'monthly_growth' => $lastMonthRevenue > 0 ? (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0
                ],
                'quick_stats' => [
                    'total_customers' => $totalCustomers,
                    'active_members' => $activeMembers,
                    'membership_rate' => $totalCustomers > 0 ? ($activeMembers / $totalCustomers) * 100 : 0,
                    'new_movies_this_month' => $totalMoviesThisMonth
                ]
            ]
        ]);
    }




    // Top combo bán chạy nhất
    public function topServices()
    {
        return Service::join('service_orders', 'services.id', '=', 'service_orders.service_id')
            ->join('tickets', 'service_orders.ticket_id', '=', 'tickets.id')
            ->where('tickets.status', 'paid')
            ->select(
                'services.name',
                DB::raw('SUM(service_orders.quantity) as total_quantity'),
                DB::raw('SUM(service_orders.quantity * services.price) as total_revenue')
            )
            ->groupBy('services.id', 'services.name')
            ->orderBy('total_revenue', 'desc')
            ->get();
    }

    // Mối quan hệ giữa rating và doanh thu
    public function ratingVsRevenue()
    {
        return Movie::join('reviews', 'movies.id', '=', 'reviews.movie_id')
            ->join('showtimes', 'movies.id', '=', 'showtimes.movie_id')
            ->join('tickets', 'showtimes.id', '=', 'tickets.showtime_id')
            ->select(
                'movies.title',
                DB::raw('AVG(reviews.rating) as avg_rating'),
                DB::raw('SUM(tickets.total_price) as total_revenue')
            )
            ->groupBy('movies.id', 'movies.title')
            ->get();
    }
}