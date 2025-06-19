import React from 'react';
import { Link } from 'react-router-dom';
import useBlogs from '../../hooks/useMovieBlogs';

export default function NewsSection() {
  const { blogs, loading, error } = useBlogs();
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    return imagePath.startsWith('images/')
      ? `${apiUrl}/storage/${imagePath}`
      : `${apiUrl}/storage/images/${imagePath}`;
  };

  if (loading || !blogs) return null;

  const highlightBlog = blogs[0];
  const sideBlogs = blogs.slice(1, 4);

  return (
    <section className="bg-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề + tab */}
        <div className="flex items-center mb-6">
          <h2 className=" font-bold text-gray-800 relative mr-6">
            <span className="text-yellow-600 border-l-4 border-yellow-600 pl-2">GÓC ĐIỆN ẢNH</span>
          </h2>
          
        </div>

        {/* Nội dung chia 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: bài viết nổi bật */}
          {highlightBlog && (
            <Link to={`/blogs/${highlightBlog.id}`} className="md:col-span-2 block group">
              <div className="relative h-[480px] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={getImageUrl(highlightBlog.image)}
                  alt={highlightBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">
                {highlightBlog.title}
              </h3>
             
            </Link>

          )}

          {/* Cột phải: 3 bài viết kế tiếp */}
          {/* Right side - 3 vertical items, total height = 480px */}
            <div className="flex flex-col justify-between space-y-4">
              {sideBlogs.map((blog) => (
                <Link key={blog.id} to={`/blogs/${blog.id}`} className="flex gap-4 group h-[150px]">
                  <div className="w-28 md:w-32 h-full flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={getImageUrl(blog.image)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <h4 className="font-medium text-gray-800 text-sm group-hover:text-blue-600 line-clamp-2">
                      {blog.title}
                    </h4>
                    
                  </div>
                </Link>
              ))}
            </div>
            
        </div>
        <div className="text-center mt-8">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-orange-600 border border-orange-600 px-5 py-2 rounded hover:bg-orange-600 hover:text-white transition"
          >
            Xem thêm 
          </Link>
        </div>
      </div>
    </section>
  );
}
