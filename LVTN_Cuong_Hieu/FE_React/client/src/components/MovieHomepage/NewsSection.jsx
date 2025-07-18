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
    <section>
      <section className="bg-white px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Tiêu đề + tab */}
          <div className="flex items-center mb-6">
            <h2 className="font-bold text-gray-800 relative mr-6 text-2xl">
              <span className="text-yellow-400 border-l-4 border-yellow-400 pl-2">GÓC ĐIỆN ẢNH</span>
            </h2>
          </div>

          {/* Nội dung chia 2 cột */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Cột trái: bài viết nổi bật */}
            {highlightBlog && (
              <Link to={`/blogs/${highlightBlog.id}`} className="md:col-span-2 block group">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={getImageUrl(highlightBlog.image)}
                    alt={highlightBlog.title}
                    className="w-full h-full object-fill group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="mt-8 text-lg font-semibold text-gray-800 hover:text-amber-600 transition line-clamp-2">
                  {highlightBlog.title}
                </h3>
              </Link>
            )}

            {/* Gộp 3 ảnh vào 1 cột, 3 title vào 1 cột bên cạnh */}
             <div className="col-span-2 flex flex-col gap-6">
  {sideBlogs.map((blog) => (
    <Link
      key={blog.id}
      to={`/blogs/${blog.id}`}
      className="group flex items-center gap-4"
    >
      

      {/* Ảnh bên phải */}
      <div className="w-40 h-[130px] overflow-hidden rounded shadow flex-shrink-0">
        <img
          src={getImageUrl(blog.image)}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      {/* Tiêu đề bên trái */}
      <div className="flex-1 translate-y-[-55px]">
        <h4 className="font-bold text-gray-800 text-base group-hover:text-amber-600 line-clamp-2">
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
              className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-black font-semibold px-6 py-2 rounded shadow-md transition duration-300"
            >
              Xem thêm 
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}