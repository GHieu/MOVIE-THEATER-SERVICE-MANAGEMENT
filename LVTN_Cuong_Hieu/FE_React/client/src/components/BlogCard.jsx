import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../hooks/dateUtils';

export default function BlogCard({ blog }) {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    
    if (imagePath.startsWith('images/')) {
      return `${apiUrl}/storage/${imagePath}`;
    }
    
    return `${apiUrl}/storage/images/${imagePath}`;
  };

  return (
    <Link 
      to={`/blogs/${blog.id}`}
      className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 block"
    >
      <div className="aspect-video bg-gray-300 overflow-hidden">
        <img 
          src={getImageUrl(blog.image)} 
          alt={blog.title}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
          onError={(e) => {
            if (e.target.src !== `${window.location.origin}/placeholder-image.jpg`) {
              e.target.src = '/placeholder-image.jpg';
              e.target.setAttribute('data-fallback', 'true');
            }
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 mb-4">
          {blog.content}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Tác giả: {blog.admin?.name || 'Admin'}</span>
          <span>{formatDate(blog.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}