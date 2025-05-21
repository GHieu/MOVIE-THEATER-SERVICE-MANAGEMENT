import React from 'react';

const newsList = [
  {
    id: 1,
    title: 'Bom tấn mùa hè bùng nổ phòng vé',
    image: 'https://via.placeholder.com/300x180', // Thay bằng link thật sau
    description: 'Những bộ phim hành động mãn nhãn đang khuấy đảo các rạp chiếu trên toàn quốc.',
  },
  {
    id: 2,
    title: 'Phim hoạt hình hay nhất 2025',
    image: 'https://via.placeholder.com/300x180',
    description: 'Top phim hoạt hình được yêu thích, phù hợp cho cả gia đình mùa hè này.',
  },
  {
    id: 3,
    title: 'Phim Việt gây sốt phòng vé',
    image: 'https://via.placeholder.com/300x180',
    description: 'Nội dung hấp dẫn, chất lượng ngày càng nâng tầm điện ảnh Việt.',
  },
];

export default function NewsSection() {
  return (
    <section className="bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tin tức điện ảnh</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <div key={news.id} className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300">
              <img src={news.image} alt={news.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{news.title}</h3>
                <p className="text-sm text-gray-600">{news.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
