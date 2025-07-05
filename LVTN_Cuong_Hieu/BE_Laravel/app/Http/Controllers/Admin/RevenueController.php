<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Ticket;
use App\Models\ServiceOrder;

class RevenueController extends Controller
{
    /**
     * Thống kê doanh thu theo ngày
     * GET /api/revenue/daily?date=2024-12-25
     */
    public function dailyRevenue(Request $request)
    {
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
}