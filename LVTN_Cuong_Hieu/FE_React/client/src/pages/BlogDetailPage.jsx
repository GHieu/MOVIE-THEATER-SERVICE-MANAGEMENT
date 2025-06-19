// pages/BlogDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useBlogDetail from '../hooks/useBlogDetail';
import { incrementBlogView } from '../services/apiBlogs';
import BlogDetailHeader from '../components/BlogDetailHeader';
import BlogDetailContent from '../components/BlogDetailContent';
import RelatedBlogs from '../components/RelatedBlogs';
import SidebarNowShowing from "../components/MovieDetail/SidebarNowShowing";
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blog, relatedBlogs, loading, error, refetchBlog } = useBlogDetail(id);

  // Increment view count khi component mount
  useEffect(() => {
    if (id) {
      incrementBlogView(id);
    }
  }, [id]);

  // Handle share
  const handleShare = async () => {
    if (!blog) return;

    const shareData = {
      title: blog.title,
      text: blog.content?.substring(0, 100).replace(/<[^>]*>/g, '') + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã copy link vào clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã copy link vào clipboard!');
      } catch (clipboardErr) {
        console.error('Clipboard error:', clipboardErr);
      }
    }
  };

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg p-6 mb-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-20 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-40"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải bài viết
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-x-4">
            <button
              onClick={refetchBlog}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Thử lại
            </button>
            
            <button
              onClick={handleGoBack}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy bài viết
          </h1>
          <p className="text-gray-600 mb-6">
            Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          
          <button
            onClick={handleGoBack}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                                    {/* Header */}
                    <BlogDetailHeader 
                        blog={blog} 
                        onShare={handleShare}
                        onGoBack={handleGoBack}
                    />
                    
                    {/* Main content */}
                    <BlogDetailContent blog={blog} />
                    
                    {/* Related blogs */}
                    <RelatedBlogs 
                        blogs={relatedBlogs} 
                        currentBlogId={id}
                    />
                </div>
                <div className="lg:col-span-1">
                    <SidebarNowShowing />
                </div>
            </div>
        </div>
        
      
    </div>
  );
}