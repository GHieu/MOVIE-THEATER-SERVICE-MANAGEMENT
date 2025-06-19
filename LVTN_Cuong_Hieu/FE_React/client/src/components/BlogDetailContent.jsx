// components/blog/BlogDetailContent.jsx
import React from 'react';

export default function BlogDetailContent({ blog }) {
  // Function để xử lý đường dẫn ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    
    if (imagePath.startsWith('images/')) {
      return `${apiUrl}/storage/${imagePath}`;
    }
    return `${apiUrl}/storage/images/${imagePath}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <article className="prose prose-lg max-w-none">
        {/* Featured image */}
        {blog.image && (
          <div className="mb-8">
            <img
              src={getImageUrl(blog.image)}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                if (e.target.src !== `${window.location.origin}/placeholder-image.jpg`) {
                  e.target.src = '/placeholder-image.jpg';
                }
              }}
            />
          </div>
        )}

        {/* Blog content */}
        <div className="text-gray-800 leading-relaxed">
          {/* Nếu content là HTML */}
          {blog.content && blog.content.includes('<') ? (
            <div 
              dangerouslySetInnerHTML={{ __html: blog.content }}
              className="prose-content"
            />
          ) : (
            /* Nếu content là plain text */
            <div className="whitespace-pre-wrap">
              {blog.content}
            </div>
          )}
        </div>

        {/* Tags nếu có */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}