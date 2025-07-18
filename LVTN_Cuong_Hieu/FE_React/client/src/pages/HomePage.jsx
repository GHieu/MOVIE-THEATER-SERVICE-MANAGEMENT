import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Banner from '../components/MovieHomepage/Banner';
import MovieTabs from '../components/MovieMoviePage/MovieTabs';
import NewsSection from '../components/MovieHomepage/NewsSection';
import QuickBooking from '../components/MovieHomepage/QuickBooking';
import useMoviesUser from '../hooks/useMovieUser';
import useRatingMovies from '../hooks/useRatingMovies';

export default function HomePage() {
  const navigate = useNavigate();
  const { nowShowing, comingSoon, loading, error } = useMoviesUser();
  const [currentTab, setCurrentTab] = useState('now');

  // 👉 Fetch reviews in HomePage only
  const { reviews, fetchReviews } = useRatingMovies();

  useEffect(() => {
    fetchReviews(); // ← Gọi API reviews 1 lần khi vào HomePage
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="relative">
          <Banner />
          <div className="absolute w-full top-[92%] z-20 flex justify-center">
            <QuickBooking />
          </div>
        </div>
       
     

        <section className="max-w-7xl mx-auto px-4 pt-5 pb-6 lg:py-10 space-y-4 ">
          {loading && <p className="text-center">Đang tải phim...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              <MovieTabs
                nowShowing={nowShowing}
                comingSoon={comingSoon}
                defaultTab={currentTab}
                onTabChange={setCurrentTab}
                reviews={reviews} // <-- truyền reviews xuống
              />

              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/movies', { state: { tab: currentTab } })}
                  className="border border-yellow-400 text-yellow-500 bg-white hover:bg-yellow-400 hover:text-black font-semibold px-6 py-2 rounded shadow-md transition duration-300"
                >
                  Xem thêm
                </button>
              </div>
            </>
          )}
        </section>

        <section className="bg-white border-t border-gray-200  ">
          <NewsSection />
        </section>
      </main>
    </div>
  );
}