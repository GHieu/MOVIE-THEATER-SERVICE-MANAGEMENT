// src/pages/HomePage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import MovieCard from '../components/MovieCard';

import NewsSection from '../components/NewsSection';
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
    
      <main className="flex-grow">
        <Banner />
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Phim đang chiếu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* MovieCard tĩnh mẫu */}
            <MovieCard />
            <MovieCard />
            <MovieCard />
            <MovieCard />
          </div>
        </section>
         <NewsSection />
      </main>
   
    </div>
  );
}