import React from 'react';
import BlogList from '../components/BlogList';
import SidebarNowShowing from "../components/MovieDetail/SidebarNowShowing";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content - Blog List */}
          <div className="lg:col-span-2">
            <BlogList />
          </div>
          
          {/* Sidebar - Upcoming Movies */}
          <div className="lg:col-span-1">
            <SidebarNowShowing />
          </div>
        </div>
      </div>
    </div>
  );
}