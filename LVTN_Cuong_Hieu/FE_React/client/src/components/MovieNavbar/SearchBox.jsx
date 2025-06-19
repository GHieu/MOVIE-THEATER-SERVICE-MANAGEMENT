import React, { useState } from "react";

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-2 hover:text-yellow-400 transition"
        title="Tìm kiếm phim"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isSearchOpen && (
        <div className="absolute right-0 top-full mt-2 w-80   z-50">
          <div className="p-3">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Tìm kiếm phim..."
                className="flex-grow px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none  text-sm text-gray-900"
                autoFocus
              />
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}