function NewsDetail({ newsData }) {
  const { news } = newsData;
  
  return (
    <div>
      <div className="space-y-12 mt-12">
        <div className="card">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {news.title}
            </h1>
          </div>
          
          {/* Ảnh */}
          <div className="mb-8">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
          
          {/* Nội dung */}
          <div className="prose max-w-none">
            <div className="text-gray-900 leading-relaxed text-lg whitespace-pre-wrap text-justify">
              {news.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;