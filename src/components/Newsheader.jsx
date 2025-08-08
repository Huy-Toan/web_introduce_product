// NewsHeaderBanner.jsx
export const NewsHeaderBanner = () => {
  return (
    <section className="bg-gradient-to-r from-blue-200 to-blue-800 text-white py-12 mt-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Tin Tức</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Cập nhật những tin tức mới nhất về hoạt động thư viện, sự kiện và thông báo quan trọng
        </p>
      </div>
    </section>
  );
};