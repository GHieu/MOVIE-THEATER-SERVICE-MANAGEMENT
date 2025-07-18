import React, { useState, useMemo } from 'react';
import { useAdminMembership } from '../../hooks/Admin/useAdminMembership';

const AdminMembership = () => {
  const { 
    memberships, 
    loading, 
    error, 
    addMembership, 
    updateMembership,
    setError,
    getMemberTypeByPoints,
    getTierInfo
  } = useAdminMembership();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    member_type: 'Silver',
    point: 0,
    updateMode: 'add_points' // 'add_points' hoặc 'set_total'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Auto-calculate member type when points change
  const currentAutoTier = useMemo(() => {
    if (formData.point > 0) {
      return getMemberTypeByPoints(formData.point);
    }
    return 'Silver';
  }, [formData.point, getMemberTypeByPoints]);

  // Filtered and paginated data
  const filteredMemberships = useMemo(() => {
    return memberships.filter(membership => {
      const matchesSearch = searchTerm === '' || 
        membership.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.customer_id.toString().includes(searchTerm) ||
        membership.id.toString().includes(searchTerm);
      
      const matchesType = filterType === '' || membership.member_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [memberships, searchTerm, filterType]);

  const paginatedMemberships = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMemberships.slice(startIndex, endIndex);
  }, [filteredMemberships, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, itemsPerPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'point' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('Form submitted:', { editingId, formData });
  
  if (editingId) {
    const currentMembership = memberships.find(m => m.id === editingId);
    const updateData = {
      point: parseInt(formData.point),
      updateTotalPoints: formData.updateMode === 'set_total'
    };
    
    const result = await updateMembership(editingId, updateData);
    
    if (result.success) {
      setEditingId(null);
      setShowAddForm(false);
      resetForm();
      alert('Cập nhật thành công! Vui lòng kiểm tra hạng thành viên đã được cập nhật.');
    } else {
      const errorMessage = typeof result.error === 'object' 
        ? Object.values(result.error).flat().join(', ') 
        : result.error;
      alert(`Cập nhật thất bại: ${errorMessage}`);
    }
  } else {
    const result = await addMembership({
      ...formData,
      point: parseInt(formData.point)
    });
    
    if (result.success) {
      setShowAddForm(false);
      resetForm();
      alert('Thêm thành công! Hạng thành viên sẽ được tự động tính toán.');
    } else {
      const errorMessage = typeof result.error === 'object' 
        ? Object.values(result.error).flat().join(', ') 
        : result.error;
      alert(`Thêm thất bại: ${errorMessage}`);
    }
  }
};

  const resetForm = () => {
    setFormData({
      customer_id: '',
      member_type: 'Silver',
      point: 0,
      updateMode: 'add_points'
    });
    setError(null);
  };

  const handleEdit = (membership) => {
    setFormData({
      customer_id: membership.customer_id,
      member_type: membership.member_type,
      point: membership.point || 0,
      updateMode: 'add_points'
    });
    setEditingId(membership.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  // Helper function to get tier display name
  const getTierDisplayName = (tierCode) => {
    switch(tierCode) {
      case 'Silver': return 'Bạc';
      case 'Gold': return 'Vàng';
      case 'Diamond': return 'Kim Cương';
      default: return tierCode;
    }
  };

  // Component to display tier rules
  const TierRulesInfo = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Quy tắc phân hạng (dựa trên total points):</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Bạc</span>
        <span className="text-gray-600">Dưới 300 điểm</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Vàng</span>
        <span className="text-gray-600">300 - 999 điểm</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Kim Cương</span>
        <span className="text-gray-600">1000+ điểm</span>
      </div>
    </div>
    <div className="mt-2 text-xs text-blue-600">
      💡 <strong>Lưu ý:</strong> Hạng thành viên được tính dựa trên tổng điểm tích lũy (total points), không phải điểm hiện tại (point)
    </div>
  </div>
);

  // Debug Info Component
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="  mb-6">
      
        <div className="text-xs text-yellow-700 space-y-1">
          <div>Tổng thành viên: {memberships.length}</div>
       
        </div>
      </div>
    );
  };

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
          pages.push(1);
          if (startPage > 2) pages.push('...');
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        if (endPage < totalPages) {
          if (endPage < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMemberships.length)} 
            trong tổng số {filteredMemberships.length} kết quả
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm border rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white border-blue-500'
                  : page === '...'
                  ? 'bg-white text-gray-400 cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  if (loading && memberships.length === 0) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Thành Viên</h1>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={showAddForm}
        >
          Thêm Thành Viên
        </button>
      </div>

      {/* Debug Info */}
      <DebugInfo />

      {/* Tier Rules Info */}
      <TierRulesInfo />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên, ID khách hàng hoặc ID thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Lọc theo loại thành viên</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="Silver">Bạc (Silver)</option>
              <option value="Gold">Vàng (Gold)</option>
              <option value="Diamond">Kim Cương (Diamond)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hiển thị</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value={5}>5 mục/trang</option>
              <option value={10}>10 mục/trang</option>
              <option value={20}>20 mục/trang</option>
              <option value={50}>50 mục/trang</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Form thêm/sửa */}
      {showAddForm && (
  <div className="bg-white border rounded-lg p-6 mb-6">
    <h2 className="text-lg font-semibold mb-4">
      {editingId ? 'Cập Nhật Thành Viên' : 'Thêm Thành Viên Mới'}
    </h2>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      {!editingId && (
        <div>
          <label className="block text-sm font-medium mb-1">ID Khách Hàng *</label>
          <input
            type="number"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Điểm {editingId ? '(Cập nhật)' : '(Khởi tạo)'} *
        </label>
        <input
          type="number"
          name="point"
          value={formData.point}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2"
          min="0"
          max="100000"
          required
        />
        
        {editingId && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Chế độ cập nhật:</label>
            <select
              name="updateMode"
              value={formData.updateMode}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="add_points">Chỉ cập nhật điểm hiện tại (point)</option>
              <option value="set_total">Cập nhật cả tổng điểm (total points)</option>
            </select>
          </div>
        )}
        
        {(formData.point > 0 && (!editingId || formData.updateMode === 'set_total')) && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-800">
              🎯 <strong>Hạng dự kiến (nếu total_points = {formData.point}):</strong>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                currentAutoTier === 'Diamond' ? 'bg-purple-100 text-purple-800' :
                currentAutoTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getTierDisplayName(currentAutoTier)}
              </span>
            </div>
            {formData.point < 1000 && (
              <div className="text-xs text-green-600 mt-1">
                {formData.point < 300 
                  ? `Cần thêm ${300 - formData.point} điểm để lên hạng Vàng`
                  : `Cần thêm ${1000 - formData.point} điểm để lên hạng Kim Cương`
                }
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : (editingId ? 'Cập Nhật' : 'Thêm Mới')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Hủy
        </button>
      </div>
    </form>
  </div>
)}

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại Thành Viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm Hiện Tại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Điểm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến Độ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedMemberships.map((membership) => {
              const currentPoints = membership.point || 0;
              const totalPoints = membership.total_points || 0;
              const tierInfo = getTierInfo(totalPoints); // Dùng total_points để tính tier
              const expectedTier = getMemberTypeByPoints(totalPoints);
              const tierMismatch = membership.member_type !== expectedTier;
              
              return (
                <tr key={membership.id} className={tierMismatch ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {membership.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {membership.customer?.name || `Customer ID: ${membership.customer_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        membership.member_type === 'Diamond' ? 'bg-purple-100 text-purple-800' :
                        membership.member_type === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                        membership.member_type === 'Silver' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {getTierDisplayName(membership.member_type)}
                      </span>
                     
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentPoints.toLocaleString()} điểm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-semibold">{totalPoints.toLocaleString()}</span> điểm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tierInfo.nextTier ? (
                      <div className="text-xs">
                        <div>Còn {tierInfo.pointsToNext} điểm</div>
                        <div>để lên {getTierDisplayName(tierInfo.nextTier)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(tierInfo.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-purple-600 font-semibold text-xs">Cao nhất</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(membership)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={showAddForm}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {paginatedMemberships.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filteredMemberships.length === 0 && (searchTerm || filterType) 
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có thành viên nào'
            }
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && <Pagination />}
      </div>
    </div>
  );
};

export default AdminMembership;