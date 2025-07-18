// src/components/Banner.jsx
import React, { useRef } from 'react';
import Slider from 'react-slick';
import useMovies from '../../hooks/useMovieUser';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Banner() {
  const { nowShowing: banner, loading } = useMovies();
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  // Custom Arrow Components
  const CustomPrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      style={{ zIndex: 30 }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const CustomNextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      style={{ zIndex: 30 }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  const settings = {
    centerMode: true,
    infinite: true,
    slidesToShow: 1, // Hiển thị 3 ảnh
    centerPadding: '150px', // Padding để hiển thị phần ảnh bên cạnh
    slidesToScroll: 1,
    speed: 1200,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    dots: true,
    appendDots: dots => <ul>{dots}</ul>, // phải có dòng này để custom hoạt động
    dotsClass: "banner-custom-dots",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    focusOnSelect: true, // Cho phép click vào slide để chuyển
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: '150px'
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: '100px'
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0px'
        }
      }
    ]
  };

  if (loading || banner.length === 0) return null;

  return (
    <>
      {/* Inject CSS styles */}
      <style>{`
        .banner-custom-dots {
          position: absolute !important;
          bottom: 45px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          padding-left: 0 !important;
          margin-bottom: 0 !important;
          list-style: none !important;
          text-align: center !important;
          z-index: 15 !important;
        }
        
        .banner-custom-dots li {
          position: relative !important;
          display: inline-block !important;
          width: auto !important;
          height: auto !important;
          margin: 0 6px !important;
          padding: 0 !important;
          cursor: pointer !important;
        }
        
        .banner-custom-dots li button {
          font-size: 0 !important;
          line-height: 0 !important;
          display: block !important;
          width: 10px !important;
          height: 10px !important;
          padding: 0 !important;
          cursor: pointer !important;
          color: transparent !important;
          border: none !important;
          outline: none !important;
          border-radius: 50% !important;
          border: 2px solid #A9A9A9 !important; /* Viền bạc đậm */
          background: transparent !important;
          transition: all 0.3s ease !important;
          
        }
        
        .banner-custom-dots li button:hover {
          background: rgba(255, 255, 255, 0.8) !important;
          transform: scale(1.25) !important;
        }
        
        .banner-custom-dots li.slick-active button {
          background: white !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
        
        .banner-custom-dots li button:before {
          display: none !important;
        }
        
        .banner-slider .slick-slide {
          height: 450px;
          padding: 0 30px; /* Khoảng cách giữa các slide */
          transition: all 0.3s ease;
        }
        
        /* Style cho slide center (ảnh chính) - full opacity */
        .banner-slider .slick-slide.slick-center {
          opacity: 1;
          z-index: 10;
        }
        
        
        
        .banner-slider .slick-list,
        .banner-slider .slick-track {
          height: 100%;
          
        }
        
        /* Container cho slider */
        .banner-slider {
          position: relative;
          overflow: hidden;
        }
        
        /* Hiệu ứng hover cho slide center */
        .banner-slider .slick-slide.slick-center .movie-slide:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      <div className="banner-slider">
        <Slider ref={sliderRef} {...settings}>
          {banner.map((movie, index) => (
            <div key={movie.id || index}>
              <div className="movie-slide relative w-[1360] h-[400px]  mt-10  shadow-md  overflow-hidden cursor-pointer group transition-transform duration-300" 
                   onClick={() => navigate(`/movies/${movie.id}`)}>
                <img
                  src={movie.banner}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-fill transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t  " />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
}