import React from 'react';

export default function Banner() {
  return (
    <div
      className="h-[400px] bg-cover bg-center relative rounded-b-3xl shadow-lg"
      style={{ backgroundImage: "url('/assets/banner.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <h2 className="text-4xl md:text-5xl text-white font-bold">Absolute cinema</h2>
      </div>
    </div>
  );
}