// components/blog/RelatedBlogs.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function RelatedBlogs({ blogs, currentBlogId }) {
  // Function để xử lý đường dẫn ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    
    if (imagePath.startsWith('images/')) {
      return `${apiUrl}/storage/${imagePath}`;
    }
    return `${apiUrl}/storage/images/${imagePath}`;
  };

  // Lọc bỏ blog hiện tại và lấy tối đa 3 blogs
  const filteredBlogs = blogs
    .filter(blog => blog.id !== parseInt(currentBlogId))
    .slice(0, 3);

  if (filteredBlogs.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Bài viết liên quan
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 block"
            >
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={getImageUrl(blog.image)}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  onError={(e) => {
                    if (e.target.src !== `${window.location.origin}/placeholder-image.jpg`) {
                      e.target.src = '/placeholder-image.jpg';
                    }
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-3">
                  {blog.content?.replace(/<[^>]*>/g, '')}
                </p>
                
                <div className="mt-3 text-xs text-gray-500">
                  Tác giả: {blog.admin?.name || 'Admin'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}