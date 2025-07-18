import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';
import { fetchRevenueOverview, fetchMonthlyRevenue, fetchDailyRevenue } from '../../services/ADMINS/apiAdminRevenue';

const AdminRevenue = () => {
  const [overview, setOverview] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overviewData, monthlyData] = await Promise.all([
          fetchRevenueOverview(),
          fetchMonthlyRevenue()
        ]);
        setOverview(overviewData.data);
        setDailyStats(monthlyData.data.daily_stats);
      } catch (error) {
        console.error('Error loading revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const revenueBreakdown = overview ? [
    { name: 'Doanh thu vé', value: overview.today_ticket_revenue, color: '#3B82F6' },
    { name: 'Doanh thu dịch vụ', value: overview.today_service_revenue, color: '#10B981' }
  ] : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống kê doanh thu</h1>
          <p className="text-gray-600">Tổng quan doanh thu và phân tích xu hướng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview?.today_revenue || 0)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng này</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview?.month_revenue || 0)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Năm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview?.year_revenue || 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ dịch vụ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview ? Math.round((overview.today_service_revenue / overview.today_revenue) * 100) : 0}%
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cơ cấu doanh thu hôm nay</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4 space-x-6">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Days Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 ngày có doanh thu cao nhất</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Ngày</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Doanh thu</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Số vé</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Trung bình/vé</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.top_days?.map((day, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3 text-sm font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-sm text-gray-900">
                        {formatCurrency(day.revenue)}
                      </td>
                      <td className="p-3 text-sm text-gray-900">
                        {day.ticket_count}
                      </td>
                      <td className="p-3 text-sm text-gray-900">
                        {formatCurrency(day.revenue / day.ticket_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;