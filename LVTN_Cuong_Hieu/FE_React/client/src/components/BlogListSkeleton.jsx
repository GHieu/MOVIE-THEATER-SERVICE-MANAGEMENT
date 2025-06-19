import React from 'react';

export default function BlogListSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 bg-gray-300 rounded w-64 mb-4 animate-pulse"></div>
        <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
            <div className="aspect-video bg-gray-300"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}