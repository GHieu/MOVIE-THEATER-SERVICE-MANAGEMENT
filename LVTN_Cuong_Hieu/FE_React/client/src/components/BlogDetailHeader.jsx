// components/blog/BlogDetailHeader.jsx
import React from 'react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogDetailHeader({ blog, onShare, onGoBack }) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Chưa rõ';
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          
          <button
            onClick={onShare}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Chia sẻ
          </button>
        </div>

        {/* Blog title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* Blog meta */}
        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-6">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>Tác giả: {blog.admin?.name || 'Admin'}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(blog.created_at || blog.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}