import React, { useState } from 'react';
import BlogCard from './BlogCard';
import BlogPagination from './BlogPagination';
import BlogSearch from './BlogSearch';
import useMovieBlogs from '../hooks/useMovieBlogs';
import BlogListSkeleton from './BlogListSkeleton';

export default function BlogList() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    blogs,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
    refetch
  } = useMovieBlogs(1, 6, searchTerm);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  if (loading) return <BlogListSkeleton />;
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Không thể tải tin tức: {error}</p>
        <button 
          onClick={refetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
          <h2 className="  py-1 mb-5 font-semibold ">
            <span className="text-yellow-400 border-l-4 border-yellow-400 pl-2 text-2xl ">Tin tức điện ảnh</span>
          </h2>
        <BlogSearch onSearch={handleSearch} />
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'Không tìm thấy bài viết nào.' : 'Chưa có tin tức nào được đăng.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setPage(page)}
            onNext={() => setPage(currentPage + 1)}
            onPrev={() => setPage(currentPage - 1)}
          />
        </>
      )}
    </div>
  );
}
